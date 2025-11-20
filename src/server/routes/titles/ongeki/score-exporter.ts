import { parse } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/server/db"
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

const OngekiKamaitachiRoutes = new Hono().get("export", async c => {
	try {
		const { userId, versions } = c.payload
		const version = versions.ongeki_version

		const [profileResults] = await db.execute<RowDataPacket[]>(
			`SELECT playerRating FROM ongeki_profile_data WHERE user = ? AND version = ?`,
			[userId, version]
		)

		const profile = profileResults.length > 0 ? profileResults[0] : null

		const [playlogResults] = await db.execute<RowDataPacket[]>(
			`SELECT
                p.userPlayDate,
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
            ORDER BY p.userPlayDate DESC`,
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
				userPlayDate,
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
					// SSS+ score
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

			const tachiScore: BatchManualScore = {
				score: techScore,
				noteLamp,
				bellLamp,
				platinumScore,
				identifier: musicId.toString(),
				matchType: "inGameID",
				difficulty: TACHI_DIFFICULTIES[level]
			}

			// Fix date parsing - ensure userPlayDate is a string
			if (userPlayDate && typeof userPlayDate === "string") {
				try {
					tachiScore.timeAchieved = fromZonedTime(
						parse(userPlayDate, "yyyy-MM-dd HH:mm:ss", toZonedTime(new Date(), "Asia/Tokyo")),
						"Asia/Tokyo"
					).valueOf()
				} catch (error) {
					// If date parsing fails, skip this field
					console.warn(`Failed to parse date: ${userPlayDate}`)
				}
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
			// Note: timing data (fast/slow) is not currently available in our database schema
			// These would need to be calculated from judge data if we want to include them
			if (maxCombo !== null) optional.maxCombo = maxCombo
			if (damageCount !== null) optional.damage = damageCount
			if (bellCount !== null) optional.bellCount = bellCount
			if (totalBellCount !== null) optional.totalBellCount = totalBellCount

			if (Object.keys(optional).length > 0) {
				tachiScore.optional = optional
			}

			tachiExport.scores.push(tachiScore)
		}

		return c.json({ success: true, data: tachiExport })
	} catch (error) {
		throw rethrowWithMessage("Failed to export data", error)
	}
})

export { OngekiKamaitachiRoutes as OngekiScoreExporterRoutes }
