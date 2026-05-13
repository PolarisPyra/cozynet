import aesjs from "aes-js"

type ByteSource = ArrayBuffer | Uint8Array | number[]

type AesBlockCipher = {
	encrypt(data: ByteSource): Uint8Array
	decrypt(data: ByteSource): Uint8Array
}

export const AesBlock = aesjs.AES as unknown as new (key: ByteSource) => AesBlockCipher

const WEB_CRYPTO_PAGE_BATCH_SIZE = 64
const FULL_PADDING_BLOCK = new Uint8Array(16).fill(16)
const nativeKeyCache = new Map<string, Promise<CryptoKey>>()

export function hexToBytes(hex: string) {
	return aesjs.utils.hex.toBytes(hex)
}

export function bytesToHex(bytes: Uint8Array) {
	return aesjs.utils.hex.fromBytes(bytes)
}

function subtleCrypto() {
	return globalThis.crypto?.subtle
}

export function hasNativeAesCbc() {
	return Boolean(subtleCrypto())
}

function nativeAesKey(keyHex: string) {
	let key = nativeKeyCache.get(keyHex)
	if (!key) {
		const subtle = subtleCrypto()
		if (!subtle) {
			throw new Error("Web Crypto AES-CBC is unavailable")
		}

		key = subtle.importKey("raw", new Uint8Array(hexToBytes(keyHex)), "AES-CBC", false, ["decrypt"])
		nativeKeyCache.set(keyHex, key)
	}

	return key
}

export function decryptCbcNoPadding(data: Uint8Array, keyHex: string, ivHex: string) {
	const output = new Uint8Array(data.length)
	decryptCbcInto(new AesBlock(hexToBytes(keyHex)), data, hexToBytes(ivHex), output)
	return output
}

export function decryptCbcInto(cipher: AesBlockCipher, encrypted: Uint8Array, iv: Uint8Array, output: Uint8Array) {
	let previous = iv

	for (let blockOffset = 0; blockOffset < encrypted.length; blockOffset += 16) {
		const block = encrypted.subarray(blockOffset, blockOffset + 16)
		const decrypted = cipher.decrypt(block)

		for (let index = 0; index < 16; index++) {
			output[blockOffset + index] = decrypted[index] ^ previous[index]
		}

		previous = block
	}
}

export function calculatePageIv(fileOffset: bigint, fileIv: Uint8Array) {
	const pageIv = new Uint8Array(16)

	for (let index = 0; index < 16; index++) {
		const shift = BigInt(8 * (index % 8))
		pageIv[index] = fileIv[index] ^ Number((fileOffset >> shift) & 0xffn)
	}

	return pageIv
}

export function decryptFscryptPagesLocal(
	keyHex: string,
	fileIv: Uint8Array,
	firstPageOffset: number,
	encrypted: Uint8Array,
	pageSize: number
) {
	if (encrypted.length % 16 !== 0) {
		throw new Error("Encrypted range is not AES block aligned")
	}

	const decrypted = new Uint8Array(encrypted.length)
	const cipher = new AesBlock(hexToBytes(keyHex))

	for (let pageOffset = 0; pageOffset < encrypted.length; pageOffset += pageSize) {
		const encryptedPage = encrypted.subarray(pageOffset, pageOffset + pageSize)
		const outputPage = decrypted.subarray(pageOffset, pageOffset + encryptedPage.length)
		const pageIv = calculatePageIv(BigInt(firstPageOffset + pageOffset), fileIv)
		decryptCbcInto(cipher, encryptedPage, pageIv, outputPage)
	}

	return decrypted
}

export async function decryptFscryptPagesNative(
	keyHex: string,
	fileIv: Uint8Array,
	firstPageOffset: number,
	encrypted: Uint8Array,
	pageSize: number
) {
	const subtle = subtleCrypto()
	if (!subtle) {
		return undefined
	}

	if (encrypted.length % 16 !== 0) {
		throw new Error("Encrypted range is not AES block aligned")
	}

	const key = await nativeAesKey(keyHex)
	const paddingCipher = new AesBlock(hexToBytes(keyHex))
	const decrypted = new Uint8Array(encrypted.length)

	for (let batchStart = 0; batchStart < encrypted.length; batchStart += WEB_CRYPTO_PAGE_BATCH_SIZE * pageSize) {
		const batchEnd = Math.min(encrypted.length, batchStart + WEB_CRYPTO_PAGE_BATCH_SIZE * pageSize)

		await Promise.all(
			Array.from({ length: Math.ceil((batchEnd - batchStart) / pageSize) }, async (_, pageIndex) => {
				const pageOffset = batchStart + pageIndex * pageSize
				const pageEnd = Math.min(encrypted.length, pageOffset + pageSize)
				const pageLength = pageEnd - pageOffset
				if (pageLength <= 0) {
					return
				}

				const encryptedPage = new Uint8Array(pageLength + 16)
				encryptedPage.set(encrypted.subarray(pageOffset, pageEnd))

				const lastCipherBlock = encrypted.subarray(pageEnd - 16, pageEnd)
				const syntheticPlainBlock = new Uint8Array(16)
				for (let index = 0; index < 16; index++) {
					syntheticPlainBlock[index] = FULL_PADDING_BLOCK[index] ^ lastCipherBlock[index]
				}
				encryptedPage.set(paddingCipher.encrypt(syntheticPlainBlock), pageLength)

				const page = await subtle.decrypt(
					{
						name: "AES-CBC",
						iv: calculatePageIv(BigInt(firstPageOffset + pageOffset), fileIv)
					},
					key,
					encryptedPage
				)

				decrypted.set(new Uint8Array(page), pageOffset)
			})
		)
	}

	return decrypted
}
