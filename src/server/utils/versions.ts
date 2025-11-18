import { HTTPException } from "hono/http-exception"
import type { PoolConnection, RowDataPacket } from "mysql2/promise"

import { DB, DaphnisUserOptionVersionKey } from "@/app/shared/types"

import { GameVersions } from "../types/jwt"

const getInitVersion = async (
	userId: number,
	versionKey: DaphnisUserOptionVersionKey,
	conn: PoolConnection
): Promise<number> => {
	switch (versionKey) {
		case DaphnisUserOptionVersionKey.Chunithm: {
			const [rows] = await conn.execute<({ version: number } & RowDataPacket)[]>(
				`SELECT MAX(version) AS version FROM chuni_profile_data WHERE user = ?`,
				[userId]
			)
			return rows[0]?.version ?? -1
		}
		case DaphnisUserOptionVersionKey.Ongeki: {
			const [rows] = await conn.execute<({ version: number } & RowDataPacket)[]>(
				`SELECT MAX(version) AS version FROM ongeki_profile_data WHERE user = ?`,
				[userId]
			)
			return rows[0]?.version ?? -1
		}
		case DaphnisUserOptionVersionKey.MaimaiDX: {
			const [rows] = await conn.execute<({ version: number } & RowDataPacket)[]>(
				`SELECT MAX(version) AS version FROM mai2_profile_detail WHERE user = ?`,
				[userId]
			)
			return rows[0]?.version ?? -1
		}
		default:
			throw new HTTPException(500, {
				message: "Invalid version key. Title not supported"
			})
	}
}

/**
 * Retrieves the set of user game versions.
 * Defaults a version to -1 if not set.
 */
export const getUserGameVersions = async (userId: number, conn: PoolConnection): Promise<GameVersions> => {
	try {
		const versionKeys = Object.values(DaphnisUserOptionVersionKey)
		const [rows] = await conn.execute<(DB.DaphnisUserOption & RowDataPacket)[]>(
			`
                SELECT \`key\`, value
                FROM cozynet_user_option
                WHERE user = ?
                    AND \`key\` IN (
                        ${versionKeys.map(key => `'${key}'`).join(",")}
                    )
            `,
			[userId]
		)

		// Ensure we have values for all version keys
		const missingVersionKeys = versionKeys.filter(key => !rows.some(v => v.key === key))

		// Insert missing version keys
		for (const key of missingVersionKeys) {
			const version = await getInitVersion(userId, key, conn)
			rows.push({ key, value: version } as DB.DaphnisUserOption & RowDataPacket)
			await conn.execute(`INSERT INTO cozynet_user_option (user, \`key\`, value) VALUES (?, ?, ?)`, [
				userId,
				key,
				version
			])
		}

		const gameVersions: GameVersions = versionKeys.reduce((acc, title) => {
			const { value } = rows.find(v => v.key === title) ?? {}
			if (value) {
				acc[title] = value as number
			}
			return acc
		}, {} as GameVersions)

		return gameVersions
	} catch (cause) {
		throw new HTTPException(500, {
			message: "Failed to fetch user versions",
			cause
		})
	}
}
