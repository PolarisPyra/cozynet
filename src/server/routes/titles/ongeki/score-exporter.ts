import { Hono } from "hono"
import { DateTime } from "luxon"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import type { PoolConnection } from "mysql2/promise"
import { z } from "zod"

import { calculateOngekiGekForceRating, calculateOngekiRating } from "@/app/shared/utils/ongeki"
import { db } from "@/server/db"
import { validateJson } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"

const TACHI_CLASSES = [undefined, "DAN_I", "DAN_II", "DAN_III", "DAN_IV", "DAN_V", "DAN_INFINITE"] as const
const TACHI_DIFFICULTIES = ["BASIC", "ADVANCED", "EXPERT", "MASTER", "LUNATIC"] as const

type BatchManualNoteLamp = "LOSS" | "CLEAR" | "FULL COMBO" | "ALL BREAK" | "ALL BREAK+"
type BatchManualBellLamp = "NONE" | "FULL BELL"
interface BatchManualScore {
	identifier: string
	matchType: "inGameID"
	score: number
	noteLamp: BatchManualNoteLamp
	bellLamp: BatchManualBellLamp
	platinumScore: number
	difficulty: "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "LUNATIC"
	timeAchieved?: number
	judgements?: {
		cbreak: number
		break: number
		hit: number
		miss: number
	}
	optional?: {
		maxCombo?: number
		fast?: number
		slow?: number
		damage?: number
		bellCount?: number
		totalBellCount?: number
	}
}
interface BatchManualImport {
	meta: {
		game: string
		playtype: string
		service: string
	}
	scores: BatchManualScore[]
	classes?: {
		dan?: string
	}
}

type ProfileRow = RowDataPacket & {
	playerRating: number | null
}

type ExportPlaylogRow = RowDataPacket & {
	timeAchieved: number | null
	musicId: number | null
	level: number | null
	techScore: number | null
	maxCombo: number | null
	judgeCriticalBreak: number | null
	judgeBreak: number | null
	judgeHit: number | null
	judgeMiss: number | null
	bellCount: number | null
	totalBellCount: number | null
	damageCount: number | null
	isFullBell: number | null
	isFullCombo: number | null
	isAllBreak: number | null
	clearStatus: number | null
	platinumScore: number | null
}

type StaticChartRow = RowDataPacket & {
	songId: number
	chartId: number
	chartLevel: number
}

type ExistingImportedScoreRow = RowDataPacket & {
	musicId: number
	level: number
	techScore: number
}

type StaticChartData = {
	chartLevel: number
}

type ImportInsertRow = [
	userId: number,
	musicId: number,
	level: number,
	clearStatus: number,
	techScore: number,
	maxCombo: number | null,
	judgeMiss: number | null,
	judgeHit: number | null,
	judgeBreak: number | null,
	judgeCriticalBreak: number | null,
	bellCount: number | null,
	totalBellCount: number | null,
	damageCount: number | null,
	isFullCombo: number,
	isFullBell: number,
	isAllBreak: number,
	playerRating: number,
	platinumScore: number | null,
	platinumScoreMax: number | null,
	platinumScoreStar: number | null,
	userPlayDate: string,
	playDate: string,
	version: number
]

type ExecutableConnection = PoolConnection & {
	execute: <T = unknown>(sql: string, values?: unknown[]) => Promise<[T, unknown]>
}

const normalizeNullableNumber = (value: unknown) => (value === null || value === undefined ? undefined : value)

const normalizeOptionalJudgements = (value: unknown) => {
	if (!value || typeof value !== "object") {
		return undefined
	}

	const judgementRecord = value as Partial<Record<"cbreak" | "break" | "hit" | "miss", unknown>>
	const requiredKeys = ["cbreak", "break", "hit", "miss"] as const

	// Older Kamai exports can send an empty judgements object. Treat that the same
	// as a missing optional field so validation does not reject the entire import.
	return requiredKeys.every(key => typeof judgementRecord[key] === "number") ? judgementRecord : undefined
}

const ImportScoreSchema = z.object({
	musicId: z.number().int().nonnegative(),
	level: z.union([z.number().int().min(0).max(3), z.literal(10)]),
	score: z.number().int().min(0),
	noteLamp: z.enum(["LOSS", "CLEAR", "FULL COMBO", "ALL BREAK", "ALL BREAK+"]),
	bellLamp: z.enum(["NONE", "FULL BELL"]),
	platinumScore: z.number().int().min(0).nullable().optional(),
	platinumScoreMax: z.number().int().min(0).nullable().optional(),
	platinumStars: z.number().int().min(0).nullable().optional(),
	// Kamai can emit null here; normalize it away so the field stays truly optional.
	timeAchieved: z.preprocess(normalizeNullableNumber, z.number().int().nonnegative().optional()),
	judgements: z.preprocess(
		normalizeOptionalJudgements,
		z
			.object({
				cbreak: z.number().int().min(0),
				break: z.number().int().min(0),
				hit: z.number().int().min(0),
				miss: z.number().int().min(0)
			})
			.optional()
	),
	maxCombo: z.number().int().min(0).optional(),
	damage: z.number().int().min(0).nullable().optional(),
	bellCount: z.number().int().min(0).nullable().optional(),
	totalBellCount: z.number().int().min(0).nullable().optional()
})

const ImportRequestSchema = z.object({
	scores: z.array(ImportScoreSchema).min(1)
})

const getImportedPlayDate = (timeAchieved?: number) => {
	if (!timeAchieved) {
		return DateTime.now().setZone("Asia/Tokyo").toFormat("yyyy-LL-dd HH:mm:ss")
	}

	return DateTime.fromMillis(timeAchieved, { zone: "utc" }).setZone("Asia/Tokyo").toFormat("yyyy-LL-dd HH:mm:ss")
}

const getExistingScoreKey = (score: ExistingImportedScoreRow) => `${score.musicId}:${score.level}:${score.techScore}`

const OngekiKamaitachiRoutes = new Hono()
	.get("export", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.ongeki_version

			const [profileResults] = await db.execute<ProfileRow>(
				`SELECT playerRating FROM ongeki_profile_data WHERE user = ? AND version = ?`,
				[userId, version]
			)

			const profile = profileResults.length > 0 ? profileResults[0] : null

			const [playlogResults] = await db.execute<ExportPlaylogRow>(
				`SELECT
				-- UNIX_TIMESTAMP returns seconds, Tachi do be needing milliseconds
                UNIX_TIMESTAMP(p.userPlayDate)*1000 as timeAchieved,
                p.musicId,
                p.level,
                p.techScore,
                p.maxCombo,
                p.judgeCriticalBreak,
                p.judgeBreak,
                p.judgeHit,
                p.judgeMiss,
                p.bellCount,
                p.totalBellCount,
                p.damageCount,
                p.isFullBell,
                p.isFullCombo,
                p.isAllBreak,
                p.clearStatus,
				p.platinumScore
            FROM ongeki_score_playlog p
            WHERE user = ?
            GROUP BY p.id
            ORDER BY timeAchieved DESC`,
				[userId]
			)

			const tachiExport: BatchManualImport = {
				meta: {
					game: "ongeki",
					playtype: "Single",
					service: "Cozynet"
				},
				scores: [],
				classes: {
					dan: TACHI_CLASSES[Math.floor((profile?.playerRating ?? 0) / 100)]
				}
			}

			for (const log of playlogResults) {
				const {
					timeAchieved,
					musicId,
					level,
					techScore,
					maxCombo,
					judgeCriticalBreak,
					judgeBreak,
					judgeHit,
					judgeMiss,
					bellCount,
					totalBellCount,
					damageCount,
					isFullBell,
					isFullCombo,
					isAllBreak,
					clearStatus,
					platinumScore
				} = log

				if (
					musicId === null ||
					level === null ||
					techScore === null ||
					clearStatus === null ||
					isFullBell === null ||
					isFullCombo === null ||
					isAllBreak === null
				) {
					continue
				}

				let noteLamp: BatchManualNoteLamp = "LOSS"

				// Determine note lamp based on clearStatus and achievements
				// According to Kamaitachi docs: LOSS, CLEAR, FULL COMBO, ALL BREAK, ALL BREAK+
				if (clearStatus >= 1) {
					if (isAllBreak && techScore >= 1007500) {
						noteLamp = "ALL BREAK+"
					} else if (isAllBreak) {
						noteLamp = "ALL BREAK"
					} else if (isFullCombo) {
						noteLamp = "FULL COMBO"
					} else {
						noteLamp = "CLEAR"
					}
				}

				let bellLamp: BatchManualBellLamp = "NONE"
				if (isFullBell) {
					bellLamp = "FULL BELL"
				}

				let difficulty = TACHI_DIFFICULTIES[level]
				if (level == 10) {
					difficulty = "LUNATIC"
				}

				const tachiScore: BatchManualScore = {
					score: Math.min(techScore, 1010000),
					noteLamp,
					bellLamp,
					platinumScore: platinumScore ?? 0,
					identifier: musicId.toString(),
					matchType: "inGameID",
					difficulty,
					timeAchieved: timeAchieved ?? undefined
				}

				if (judgeCriticalBreak !== null && judgeBreak !== null && judgeHit !== null && judgeMiss !== null) {
					tachiScore.judgements = {
						cbreak: judgeCriticalBreak,
						break: judgeBreak,
						hit: judgeHit,
						miss: judgeMiss
					}
				}

				const optional: BatchManualScore["optional"] = {}
				if (maxCombo !== null) optional.maxCombo = maxCombo
				if (damageCount !== null) optional.damage = damageCount
				if (bellCount !== null) optional.bellCount = bellCount
				if (totalBellCount !== null) optional.totalBellCount = totalBellCount

				if (Object.keys(optional).length > 0) {
					tachiScore.optional = optional
				}

				tachiExport.scores.push(tachiScore)
			}

			return c.json(tachiExport)
		} catch (error) {
			throw rethrowWithMessage("Failed to export data", error)
		}
	})
	.post("import", validateJson(ImportRequestSchema), async c => {
		const conn = (await db.getConnection()) as ExecutableConnection
		try {
			const { userId, versions } = c.payload
			const { scores } = c.req.valid("json")
			const version = versions.ongeki_version

			const musicIds = [...new Set(scores.map(score => score.musicId))]
			const chartIds = [...new Set(scores.map(score => score.level))]

			if (musicIds.length === 0 || chartIds.length === 0) {
				return c.json({ importedCount: 0, duplicateCount: 0, missingSongCount: 0, skippedCount: 0 })
			}

			const musicIdPlaceholders = musicIds.map(() => "?").join(", ")
			const chartIdPlaceholders = chartIds.map(() => "?").join(", ")

			const [staticRows] = await conn.execute<StaticChartRow[]>(
				`SELECT
					songId,
					chartId,
					MAX(level) AS chartLevel
				FROM ongeki_static_music
				WHERE songId IN (${musicIdPlaceholders})
					AND chartId IN (${chartIdPlaceholders})
				GROUP BY songId, chartId`,
				[...musicIds, ...chartIds]
			)

			const staticMap = new Map<string, StaticChartData>(
				staticRows.map(row => [`${row.songId}:${row.chartId}`, { chartLevel: row.chartLevel }])
			)

			const [existingRows] = await conn.execute<ExistingImportedScoreRow[]>(
				`SELECT
					musicId,
					level,
					techScore
				FROM ongeki_score_playlog
				WHERE user = ?
					AND musicId IN (${musicIdPlaceholders})
					AND level IN (${chartIdPlaceholders})`,
				[userId, ...musicIds, ...chartIds]
			)

			const existingKeys = new Set(existingRows.map(getExistingScoreKey))
			const seenImportKeys = new Set<string>()
			const rowsToInsert: ImportInsertRow[] = []
			let duplicateCount = 0
			let missingSongCount = 0

			for (const score of scores) {
				const playDate = getImportedPlayDate(score.timeAchieved)
				const duplicateKey = `${score.musicId}:${score.level}:${score.score}`
				const staticData = staticMap.get(`${score.musicId}:${score.level}`)

				if (!staticData) {
					missingSongCount += 1
					continue
				}

				if (existingKeys.has(duplicateKey) || seenImportKeys.has(duplicateKey)) {
					duplicateCount += 1
					continue
				}

				seenImportKeys.add(duplicateKey)

				const isAllBreak = score.noteLamp === "ALL BREAK" || score.noteLamp === "ALL BREAK+" ? 1 : 0
				const isFullCombo = isAllBreak === 1 || score.noteLamp === "FULL COMBO" ? 1 : 0
				const isFullBell = score.bellLamp === "FULL BELL" ? 1 : 0
				const clearStatus = score.noteLamp === "LOSS" ? 0 : 1
				const playerRating =
					version >= 8
						? Math.floor(
								calculateOngekiGekForceRating(staticData.chartLevel, score.score, isFullCombo, isAllBreak, isFullBell)
							)
						: Math.floor(calculateOngekiRating(staticData.chartLevel, score.score) * 100)

				rowsToInsert.push([
					userId,
					score.musicId,
					score.level,
					clearStatus,
					score.score,
					score.maxCombo ?? null,
					score.judgements?.miss ?? null,
					score.judgements?.hit ?? null,
					score.judgements?.break ?? null,
					score.judgements?.cbreak ?? null,
					score.bellCount ?? null,
					score.totalBellCount ?? null,
					score.damage ?? null,
					isFullCombo,
					isFullBell,
					isAllBreak,
					playerRating,
					score.platinumScore ?? null,
					score.platinumScoreMax ?? null,
					score.platinumStars ?? null,
					playDate,
					playDate,
					version
				])
			}

			if (rowsToInsert.length === 0) {
				return c.json({
					importedCount: 0,
					duplicateCount,
					missingSongCount,
					skippedCount: duplicateCount + missingSongCount
				})
			}

			await conn.beginTransaction()

			const valuePlaceholders = rowsToInsert
				.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
				.join(", ")

			const [result] = await conn.execute<ResultSetHeader>(
				`INSERT INTO ongeki_score_playlog (
					user,
					musicId,
					level,
					clearStatus,
					techScore,
					maxCombo,
					judgeMiss,
					judgeHit,
					judgeBreak,
					judgeCriticalBreak,
					bellCount,
					totalBellCount,
					damageCount,
					isFullCombo,
					isFullBell,
					isAllBreak,
					playerRating,
					platinumScore,
					platinumScoreMax,
					platinumScoreStar,
					userPlayDate,
					playDate,
					version
				) VALUES ${valuePlaceholders}`,
				rowsToInsert.flat()
			)

			await conn.commit()

			return c.json({
				importedCount: result.affectedRows,
				duplicateCount,
				missingSongCount,
				skippedCount: duplicateCount + missingSongCount
			})
		} catch (error) {
			await conn.rollback()
			throw rethrowWithMessage("Failed to import data", error)
		} finally {
			conn.release()
		}
	})

export { OngekiKamaitachiRoutes as OngekiScoreExporterRoutes }
