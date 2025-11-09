import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { OngekiGekForceRating, OngekiRating, getDifficultyFromOngekiChart, getOngekiGrade } from "@/utils/ongeki"

interface OngekiSongResult {
	musicId: number
	score: number
	difficultId: number
	version: string
	type: string
	isFullBell?: number
	isFullCombo?: number
	isAllBreake?: number
	title: string
	artist: string
	level: number
	genre: string
	chartId: number
}

interface OngekiRefreshSongResult {
	musicId: number
	techScoreMax: number
	platinumScoreMax?: number
	platinumScoreStar?: number
	difficultId: number
	version: string
	type: string
	isFullBell?: number
	isFullCombo?: number
	isAllBreake?: number
	title: string
	artist: string
	level: number
	genre: string
	chartId: number
	userPlayDate?: string
}

const COZY_TO_REIWA_DIFFS: Record<number, string> = {
	0: "BAS",
	1: "ADV",
	2: "EXP",
	3: "MAS",
	10: "LUN"
}

const getRank = (score: number): string => {
	if (score < 500000) return "D"
	if (score < 700000) return "C"
	if (score < 750000) return "B"
	if (score < 800000) return "BB"
	if (score < 850000) return "BBB"
	if (score < 900000) return "A"
	if (score < 940000) return "AA"
	if (score < 970000) return "AAA"
	if (score < 990000) return "S"
	if (score < 1000000) return "SS"
	if (score < 1007500) return "SSS"
	if (score <= 1010000) return "SSS+"
	return "D"
}

const getPRating = (cc: number, stars: number | null): number => {
	if (stars === null || stars === undefined) return 0
	return (cc ** 2 * stars) / 1000
}

const OngekiReiwaRoutes = new Hono()
	.get("export", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.ongeki_version

			const [usernameResults] = await db.execute<RowDataPacket[]>(`SELECT username FROM aime_user WHERE id = ?`, [
				userId
			])
			const username = usernameResults.length > 0 ? usernameResults[0].username : "Player"

			const [ratingResults] = await db.execute<RowDataPacket[]>(
				`SELECT playerRating, highestRating FROM ongeki_profile_data WHERE user = ? AND version = ?`,
				[userId, version]
			)
			const playerRating = ratingResults.length > 0 ? ratingResults[0].playerRating : 0
			const highestRating = ratingResults.length > 0 ? ratingResults[0].highestRating : 0

			// Fetch best 30 songs
			const [bestListResults] = await db.execute<(OngekiSongResult & RowDataPacket)[]>(
				`SELECT
                r.musicId,
                b.techScoreMax as score,
                r.difficultId,
                r.version,
                r.type,
                b.isFullBell,
                b.isFullCombo,
                b.isAllBreake,
                m.title,
                m.artist,
                m.level,
                m.genre,
                m.chartId
            FROM ongeki_profile_rating r
            JOIN ongeki_score_best b
                ON r.musicId = b.musicId
                AND r.difficultId = b.level
                AND b.user = r.user
            JOIN ongeki_static_music m
                ON r.musicId = m.songId
                AND r.difficultId = m.chartId
                AND r.version = m.version
            WHERE r.user = ?
                AND r.type = 'userRatingBaseBestList'
                AND r.version = ?`,
				[userId, version]
			)

			const [newListResults] = await db.execute<(OngekiSongResult & RowDataPacket)[]>(
				`SELECT
                r.musicId,
                b.techScoreMax as score,
                r.difficultId,
                r.version,
                r.type,
                b.isFullBell,
                b.isFullCombo,
                b.isAllBreake,
                m.title,
                m.artist,
                m.level,
                m.genre,
                m.chartId
            FROM ongeki_profile_rating r
            JOIN ongeki_score_best b
                ON r.musicId = b.musicId
                AND r.difficultId = b.level
                AND b.user = r.user
            JOIN ongeki_static_music m
                ON r.musicId = m.songId
                AND r.difficultId = m.chartId
                AND r.version = m.version
            WHERE r.user = ?
                AND r.type = 'userRatingBaseBestNewList'
                AND r.version = ?`,
				[userId, version]
			)

			const [hotListResults] = await db.execute<(OngekiSongResult & RowDataPacket)[]>(
				`SELECT
                r.musicId,
                b.techScoreMax as score,
                r.difficultId,
                r.version,
                r.type,
                b.isFullBell,
                b.isFullCombo,
                b.isAllBreake,
                m.title,
                m.artist,
                m.level,
                m.genre,
                m.chartId
            FROM ongeki_profile_rating r
            JOIN ongeki_score_best b
                ON r.musicId = b.musicId
                AND r.difficultId = b.level
                AND b.user = r.user
            JOIN ongeki_static_music m
                ON r.musicId = m.songId
                AND r.difficultId = m.chartId
                AND r.version = m.version
            WHERE r.user = ?
                AND r.type = 'userRatingBaseHotList'
                AND r.version = ?`,
				[userId, version]
			)

			const b30 = bestListResults
				.filter((song: OngekiSongResult) => song.musicId !== 0)
				.map((song: OngekiSongResult) => {
					const rating = OngekiRating(song.level, song.score)
					return {
						title: song.title,
						artist: song.artist,
						score: song.score,
						rank: getOngekiGrade(song.score),
						diff: getDifficultyFromOngekiChart(song.chartId),
						const: song.level,
						rating: Number((rating / 100).toFixed(2)),
						date: Date.now(),
						is_fullbell: song.isFullBell,
						is_allbreak: song.isAllBreake,
						is_fullcombo: song.isFullCombo
					}
				})

			const new15 = newListResults
				.filter((song: OngekiSongResult) => song.musicId !== 0)
				.map((song: OngekiSongResult) => {
					const rating = OngekiRating(song.level, song.score)
					return {
						title: song.title,
						artist: song.artist,
						score: song.score,
						rank: getOngekiGrade(song.score),
						diff: getDifficultyFromOngekiChart(song.chartId),
						const: song.level,
						rating: Number((rating / 100).toFixed(2)),
						date: Date.now(),
						is_fullbell: song.isFullBell,
						is_allbreak: song.isAllBreake,
						is_fullcombo: song.isFullCombo
					}
				})

			const recent = hotListResults
				.filter((song: OngekiSongResult) => song.musicId !== 0)
				.map((song: OngekiSongResult) => {
					const rating = OngekiRating(song.level, song.score)
					return {
						title: song.title,
						artist: song.artist,
						score: song.score,
						rank: getOngekiGrade(song.score),
						diff: getDifficultyFromOngekiChart(song.chartId),
						const: song.level,
						rating: Number((rating / 100).toFixed(2)),
						date: Date.now()
					}
				})

			const formattedData = {
				honor: "",
				name: username,
				rating: Number(((playerRating ?? 0) / 100).toFixed(2)),
				ratingMax: Number(((highestRating ?? 0) / 100).toFixed(2)),
				updatedAt: new Date().toISOString(),
				best: b30,
				news: new15,
				recent: recent.slice(0, 10)
			}

			return c.json(formattedData)
		} catch (error) {
			throw rethrowWithMessage("Failed to export B45 data", error)
		}
	})
	.get("exportRefresh", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.ongeki_version

			const [usernameResults] = await db.execute<RowDataPacket[]>(`SELECT username FROM aime_user WHERE id = ?`, [
				userId
			])
			const username = usernameResults.length > 0 ? usernameResults[0].username : "Player"

			// Fetch best 50 songs
			const [bestListResults] = await db.execute<(OngekiRefreshSongResult & RowDataPacket)[]>(
				`SELECT
                    r.musicId,
                    b.techScoreMax,
                    b.platinumScoreMax,
                    b.platinumScoreStar,
                    r.difficultId,
                    r.version,
                    r.type,
                    b.isFullBell,
                    b.isFullCombo,
                    b.isAllBreake,
                    m.title,
                    m.artist,
                    m.level,
                    m.genre,
                    m.chartId,
                    (SELECT userPlayDate
                     FROM ongeki_score_playlog osp
                     WHERE osp.musicId = r.musicId
                     AND osp.level = r.difficultId
                     AND osp.user = r.user
                     AND osp.techScore = b.techScoreMax
                     ORDER BY osp.userPlayDate DESC
                     LIMIT 1) as userPlayDate
                FROM ongeki_profile_rating r
                JOIN ongeki_score_best b
                    ON r.musicId = b.musicId
                    AND r.difficultId = b.level
                    AND b.user = r.user
                JOIN ongeki_static_music m
                    ON r.musicId = m.songId
                    AND r.difficultId = m.chartId
                    AND r.version = m.version
                WHERE r.user = ?
                    AND r.type = 'userNewRatingBaseBestList'
                    AND r.version = ?
                ORDER BY r.index`,
				[userId, version]
			)

			// Fetch new 10 songs
			const [newListResults] = await db.execute<(OngekiRefreshSongResult & RowDataPacket)[]>(
				`SELECT
                    r.musicId,
                    b.techScoreMax,
                    b.platinumScoreMax,
                    b.platinumScoreStar,
                    r.difficultId,
                    r.version,
                    r.type,
                    b.isFullBell,
                    b.isFullCombo,
                    b.isAllBreake,
                    m.title,
                    m.artist,
                    m.level,
                    m.genre,
                    m.chartId,
                    (SELECT userPlayDate
                     FROM ongeki_score_playlog osp
                     WHERE osp.musicId = r.musicId
                     AND osp.level = r.difficultId
                     AND osp.user = r.user
                     AND osp.techScore = b.techScoreMax
                     ORDER BY osp.userPlayDate DESC
                     LIMIT 1) as userPlayDate
                FROM ongeki_profile_rating r
                JOIN ongeki_score_best b
                    ON r.musicId = b.musicId
                    AND r.difficultId = b.level
                    AND b.user = r.user
                JOIN ongeki_static_music m
                    ON r.musicId = m.songId
                    AND r.difficultId = m.chartId
                    AND r.version = m.version
                WHERE r.user = ?
                    AND r.type = 'userNewRatingBaseBestNewList'
                    AND r.version = ?
                ORDER BY r.index`,
				[userId, version]
			)

			// Fetch pscore 50 songs
			const [pscoreListResults] = await db.execute<(OngekiRefreshSongResult & RowDataPacket)[]>(
				`SELECT
                    r.musicId,
                    b.techScoreMax,
                    b.platinumScoreMax,
                    b.platinumScoreStar,
                    r.difficultId,
                    r.version,
                    r.type,
                    b.isFullBell,
                    b.isFullCombo,
                    b.isAllBreake,
                    m.title,
                    m.artist,
                    m.level,
                    m.genre,
                    m.chartId,
                    (SELECT userPlayDate
                     FROM ongeki_score_playlog osp
                     WHERE osp.musicId = r.musicId
                     AND osp.level = r.difficultId
                     AND osp.user = r.user
                     AND osp.techScore = b.techScoreMax
                     ORDER BY osp.userPlayDate DESC
                     LIMIT 1) as userPlayDate
                FROM ongeki_profile_rating r
                JOIN ongeki_score_best b
                    ON r.musicId = b.musicId
                    AND r.difficultId = b.level
                    AND b.user = r.user
                JOIN ongeki_static_music m
                    ON r.musicId = m.songId
                    AND r.difficultId = m.chartId
                    AND r.version = m.version
                WHERE r.user = ?
                    AND r.type = 'userNewRatingBasePScoreList'
                    AND r.version = ?
                ORDER BY r.index`,
				[userId, version]
			)

			const best = bestListResults
				.filter((song: OngekiRefreshSongResult) => song.musicId !== 0)
				.map((song: OngekiRefreshSongResult) => {
					const cc = Number(song.level.toFixed(1))
					const rating = OngekiGekForceRating(
						song.level,
						song.techScoreMax,
						song.isFullCombo ?? 0,
						song.isAllBreake ?? 0,
						song.isFullBell ?? 0
					)
					return {
						id: song.musicId,
						title: song.title,
						artist: song.artist,
						const: cc,
						diff: COZY_TO_REIWA_DIFFS[song.difficultId] ?? "BAS",
						score: song.techScoreMax,
						rank: getRank(song.techScoreMax),
						update: song.userPlayDate ? new Date(song.userPlayDate).getTime() : Date.now(),
						lamps: {
							is_fullbell: Boolean(song.isFullBell),
							is_allbreak: Boolean(song.isAllBreake),
							is_fullcombo: Boolean(song.isFullCombo)
						},
						rating: Number((rating / 1000).toFixed(3)),
						is_unknown: false
					}
				})

			const newScores = newListResults
				.filter((song: OngekiRefreshSongResult) => song.musicId !== 0)
				.map((song: OngekiRefreshSongResult) => {
					const cc = Number(song.level.toFixed(1))
					const rating = OngekiGekForceRating(
						song.level,
						song.techScoreMax,
						song.isFullCombo ?? 0,
						song.isAllBreake ?? 0,
						song.isFullBell ?? 0
					)
					return {
						id: song.musicId,
						title: song.title,
						artist: song.artist,
						const: cc,
						diff: COZY_TO_REIWA_DIFFS[song.difficultId] ?? "BAS",
						score: song.techScoreMax,
						rank: getRank(song.techScoreMax),
						update: song.userPlayDate ? new Date(song.userPlayDate).getTime() : Date.now(),
						lamps: {
							is_fullbell: Boolean(song.isFullBell),
							is_allbreak: Boolean(song.isAllBreake),
							is_fullcombo: Boolean(song.isFullCombo)
						},
						rating: Number((rating / 1000).toFixed(3)),
						is_unknown: false
					}
				})

			const pscore = pscoreListResults
				.filter((song: OngekiRefreshSongResult) => song.musicId !== 0)
				.map((song: OngekiRefreshSongResult) => {
					const cc = Number(song.level.toFixed(1))
					const rating = OngekiGekForceRating(
						song.level,
						song.techScoreMax,
						song.isFullCombo ?? 0,
						song.isAllBreake ?? 0,
						song.isFullBell ?? 0
					)
					const pRating = getPRating(cc, song.platinumScoreStar ?? null)
					return {
						id: song.musicId,
						title: song.title,
						artist: song.artist,
						const: cc,
						diff: COZY_TO_REIWA_DIFFS[song.difficultId] ?? "BAS",
						score: song.techScoreMax,
						rank: getRank(song.techScoreMax),
						update: song.userPlayDate ? new Date(song.userPlayDate).getTime() : Date.now(),
						lamps: {
							is_fullbell: Boolean(song.isFullBell),
							is_allbreak: Boolean(song.isAllBreake),
							is_fullcombo: Boolean(song.isFullCombo)
						},
						rating: Number((rating / 1000).toFixed(3)),
						p_score: song.platinumScoreMax ?? 0,
						p_star: song.platinumScoreStar ?? 0,
						p_rating: Number(pRating.toFixed(3)),
						is_unknown: false
					}
				})

			const [ratingResults] = await db.execute<RowDataPacket[]>(
				`SELECT newPlayerRating FROM ongeki_profile_data WHERE user = ? AND version = ?`,
				[userId, version]
			)
			const newPlayerRating = ratingResults.length > 0 ? ratingResults[0].newPlayerRating : 0

			const formattedData = {
				honor: "",
				name: username,
				rating: Number(((newPlayerRating ?? 0) / 1000).toFixed(3)),
				updatedAt: new Date().toISOString(),
				best,
				new: newScores,
				pscore
			}

			return c.json(formattedData)
		} catch (error) {
			throw rethrowWithMessage("Failed to export Re:Fresh data", error)
		}
	})

export { OngekiReiwaRoutes }
