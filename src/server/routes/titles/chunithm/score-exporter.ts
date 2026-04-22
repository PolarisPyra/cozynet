import { Hono } from "hono"
import { DateTime } from "luxon"
import type { RowDataPacket } from "mysql2"
import type { ResultSetHeader } from "mysql2"
import type { PoolConnection } from "mysql2/promise"
import { z } from "zod"

import { calculateChunithmRating } from "@/app/shared/utils/chunithm"
import { db } from "@/server/db"
import { validateJson } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"

const TACHI_CLASSES = [undefined, "DAN_I", "DAN_II", "DAN_III", "DAN_IV", "DAN_V", "DAN_INFINITE"] as const
const TACHI_DIFFICULTIES = ["BASIC", "ADVANCED", "EXPERT", "MASTER", "ULTIMA"] as const
const IMPORT_CLEAR_LAMP_TO_SKILL_ID: Partial<Record<BatchManualClearLamp, number>> = {
	HARD: 103003,
	BRAVE: 103005,
	ABSOLUTE: 103006,
	CATASTROPHY: 103007
}
const VERSION_TO_ROM_VERSION: Record<number, string> = {
	1: "10500",
	2: "11000",
	3: "11500",
	4: "12000",
	5: "12500",
	6: "13000",
	7: "13500",
	8: "14000",
	9: "14500",
	10: "15000",
	11: "20000",
	12: "20500",
	13: "21000",
	14: "21500",
	15: "22000",
	16: "22500",
	17: "23000",
	18: "24000"
}

type BatchManualClearLamp = "CATASTROPHY" | "ABSOLUTE" | "BRAVE" | "HARD" | "CLEAR" | "FAILED"
type BatchManualNoteLamp = "ALL JUSTICE CRITICAL" | "ALL JUSTICE" | "FULL COMBO" | "NONE"
interface BatchManualScore {
	identifier: string
	matchType: "inGameID"
	score: number
	noteLamp: BatchManualNoteLamp
	clearLamp: BatchManualClearLamp
	difficulty: "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "ULTIMA"
	timeAchieved?: number
	judgements?: {
		jcrit: number
		justice: number
		attack: number
		miss: number
	}
	optional?: {
		maxCombo: number
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
		emblem?: string
	}
}

type StaticChartRow = RowDataPacket & {
	songId: number
	chartId: number
	chartLevel: number
}

type ProfileRow = RowDataPacket & {
	classEmblemBase: number | null
	classEmblemMedal: number | null
}

type ExportPlaylogRow = RowDataPacket & {
	timeAchieved: number | null
	romVersion: string | null
	musicId: number | null
	level: number | null
	score: number | null
	maxCombo: number | null
	judgeGuilty: number | null
	judgeAttack: number | null
	judgeJustice: number | null
	judgeCritical: number | null
	judgeHeaven: number | null
	isFullCombo: number | null
	isAllJustice: number | null
	isClear: number | null
	skillCategoryId: number | null
}

type ExistingImportedScoreRow = RowDataPacket & {
	musicId: number
	level: number
	score: number
	timeAchieved: number | null
}

type StaticChartData = {
	chartLevel: number
}

type ImportInsertRow = [
	userId: number,
	musicId: number,
	level: number,
	score: number,
	maxCombo: number | null,
	judgeGuilty: number | null,
	judgeAttack: number | null,
	judgeJustice: number | null,
	judgeCritical: number | null,
	judgeHeaven: number,
	isFullCombo: number,
	isAllJustice: number,
	isClear: number,
	skillId: number | null,
	fullChainKind: number,
	playerRating: number,
	userPlayDate: string,
	playDate: string,
	romVersion: string
]

type ExecutableConnection = PoolConnection & {
	execute: <T = unknown>(sql: string, values?: unknown[]) => Promise<[T, unknown]>
}

const ImportScoreSchema = z.object({
	musicId: z.number().int().nonnegative(),
	level: z.number().int().min(0).max(4),
	score: z.number().int().min(0),
	noteLamp: z.enum(["ALL JUSTICE CRITICAL", "ALL JUSTICE", "FULL COMBO", "NONE"]),
	clearLamp: z.enum(["CATASTROPHY", "ABSOLUTE", "BRAVE", "HARD", "CLEAR", "FAILED"]),
	timeAchieved: z.number().int().nonnegative().optional(),
	judgements: z
		.object({
			jcrit: z.number().int().min(0),
			justice: z.number().int().min(0),
			attack: z.number().int().min(0),
			miss: z.number().int().min(0)
		})
		.optional(),
	maxCombo: z.number().int().min(0).optional()
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

const getExistingScoreKey = (score: { musicId: number; level: number; score: number; timeAchieved: number | null }) =>
	`${score.musicId}:${score.level}:${score.score}:${score.timeAchieved ?? 0}`

const ChunithmKamaitachiRoutes = new Hono()
	.get("export", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.chunithm_version

			const [profileResults] = await db.execute<ProfileRow>(
				`SELECT classEmblemBase, classEmblemMedal
       FROM chuni_profile_data
       WHERE user = ? AND version = ?`,
				[userId, version]
			)

			const profile = profileResults.length > 0 ? profileResults[0] : null

			const [playlogResults] = await db.execute<ExportPlaylogRow>(
				`SELECT
				-- UNIX_TIMESTAMP returns seconds, Tachi do be needing milliseconds
				UNIX_TIMESTAMP(p.userPlayDate)*1000 as timeAchieved,
				p.romVersion,
				p.musicId,
				p.level,
				p.score,
				p.maxCombo,
				p.judgeGuilty,
				p.judgeAttack,
				p.judgeJustice,
				p.judgeCritical,
				p.judgeHeaven,
				p.isFullCombo,
				p.isAllJustice,
				p.isClear,
				s.categoryId AS skillCategoryId
			FROM chuni_score_playlog p
			LEFT JOIN cozynet_static_chuni_skill s ON s.skillId = p.skillId
			WHERE p.user = ?
			GROUP BY p.id
			ORDER BY timeAchieved DESC`,
				[userId]
			)

			const tachiExport: BatchManualImport = {
				meta: {
					game: "chunithm",
					playtype: "Single",
					service: "Cozynet"
				},
				scores: [],
				classes: {
					dan: TACHI_CLASSES[profile?.classEmblemBase ?? 0],
					emblem: TACHI_CLASSES[profile?.classEmblemMedal ?? 0]
				}
			}

			for (const log of playlogResults) {
				const {
					timeAchieved,
					romVersion,
					musicId,
					level,
					score,
					judgeHeaven,
					judgeCritical,
					judgeJustice,
					judgeAttack,
					judgeGuilty,
					maxCombo,
					isAllJustice,
					isFullCombo,
					isClear,
					skillCategoryId
				} = log

				if (
					romVersion === null ||
					musicId === null ||
					level === null ||
					score === null ||
					judgeJustice === null ||
					isAllJustice === null ||
					isFullCombo === null ||
					isClear === null
				) {
					continue
				}

				// Filter out WORLD'S END scores
				if (romVersion.startsWith("1.") && level === 4) {
					continue
				}

				if (romVersion.startsWith("2.") && level === 5) {
					continue
				}

				let noteLamp: BatchManualNoteLamp = "NONE"
				let clearLamp: BatchManualClearLamp = "FAILED"

				if (isAllJustice && score === 1_010_000) {
					noteLamp = "ALL JUSTICE CRITICAL"
				} else if (isAllJustice) {
					noteLamp = "ALL JUSTICE"
				} else if (isFullCombo) {
					noteLamp = "FULL COMBO"
				}

				if (isClear) {
					if (skillCategoryId === 10) {
						clearLamp = "CATASTROPHY"
					} else if (skillCategoryId === 9) {
						clearLamp = "ABSOLUTE"
					} else if (skillCategoryId === 16) {
						clearLamp = "BRAVE"
					} else if (skillCategoryId === 6 || skillCategoryId === 7 || skillCategoryId === 15) {
						clearLamp = "HARD"
					} else {
						clearLamp = "CLEAR"
					}
				}

				const tachiScore: BatchManualScore = {
					score,
					noteLamp,
					clearLamp,
					identifier: musicId.toString(),
					matchType: "inGameID",
					difficulty: TACHI_DIFFICULTIES[level],
					timeAchieved: timeAchieved != null ? Number(timeAchieved) : undefined
				}

				if (judgeCritical !== null && judgeJustice !== null && judgeAttack !== null && judgeGuilty !== null) {
					tachiScore.judgements = {
						jcrit: (judgeHeaven ?? 0) + judgeCritical,
						justice: judgeJustice,
						attack: judgeAttack,
						miss: judgeGuilty
					}
				}

				if (maxCombo !== null) {
					tachiScore.optional = {
						maxCombo
					}
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
			const version = versions.chunithm_version
			const romVersion = VERSION_TO_ROM_VERSION[version] ?? VERSION_TO_ROM_VERSION[18]

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
				FROM chuni_static_music
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
					score,
					UNIX_TIMESTAMP(userPlayDate) * 1000 AS timeAchieved
				FROM chuni_score_playlog
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
				const duplicateKey = `${score.musicId}:${score.level}:${score.score}:${score.timeAchieved ?? 0}`
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

				const isAllJustice = score.noteLamp === "ALL JUSTICE" || score.noteLamp === "ALL JUSTICE CRITICAL" ? 1 : 0
				const isFullCombo = isAllJustice === 1 || score.noteLamp === "FULL COMBO" ? 1 : 0
				const isClear = score.clearLamp === "FAILED" ? 0 : 1
				const skillId = IMPORT_CLEAR_LAMP_TO_SKILL_ID[score.clearLamp] ?? null
				const playerRating = Math.floor(calculateChunithmRating(staticData.chartLevel, score.score) * 100)

				rowsToInsert.push([
					userId,
					score.musicId,
					score.level,
					score.score,
					score.maxCombo ?? null,
					score.judgements?.miss ?? null,
					score.judgements?.attack ?? null,
					score.judgements?.justice ?? null,
					score.judgements?.jcrit ?? null,
					0,
					isFullCombo,
					isAllJustice,
					isClear,
					skillId,
					0,
					playerRating,
					playDate,
					playDate,
					romVersion
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
				.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
				.join(", ")

			const [result] = await conn.execute<ResultSetHeader>(
				`INSERT INTO chuni_score_playlog (
					user,
					musicId,
					level,
					score,
					maxCombo,
					judgeGuilty,
					judgeAttack,
					judgeJustice,
					judgeCritical,
					judgeHeaven,
					isFullCombo,
					isAllJustice,
					isClear,
					skillId,
					fullChainKind,
					playerRating,
					userPlayDate,
					playDate,
					romVersion
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

export { ChunithmKamaitachiRoutes as ChunithmScoreExporterRoutes }
