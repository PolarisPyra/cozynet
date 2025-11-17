import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"
import type { DB } from "@/app/shared/types"

const OngekiCardsRoutes = new Hono().get("/", async c => {
	try {
		const { userId } = c.payload

		const [cards] = await db.execute<(RowDataPacket & DB.OngekiUserCard & DB.OngekiStaticCards)[]>(
			`SELECT
		sc.cardId,
		sc.name,
		sc.charaId,
		sc.nickName,
		sc.school,
		sc.attribute,
		sc.gakunen,
		sc.rarity,
		sc.cardNumber,
		sc.imagePath,
		sc.skillId,
		sc.opt,
		uc.id,
		uc.user,
		uc.digitalStock,
		uc.analogStock,
		uc.level,
		uc.maxLevel,
		uc.exp,
		uc.printCount,
		uc.useCount,
		uc.isNew,
		uc.kaikaDate,
		uc.choKaikaDate,
		uc.skillId,
		uc.isAcquired,
		uc.created
			FROM ongeki_static_cards sc
			INNER JOIN ongeki_user_card uc ON uc.cardId = sc.cardId AND uc.user = ? AND (uc.isAcquired = 1 OR uc.digitalStock > 0 OR uc.analogStock > 0)
			LEFT JOIN ongeki_static_opt o ON sc.opt = o.id
			LEFT JOIN daphnis_web_permissions dwp ON dwp.user = ?
			WHERE sc.imagePath IS NOT NULL AND (dwp.status = 1 OR o.isEnable = 1 OR o.name = 'A000' OR o.name IS NULL)
		ORDER BY sc.cardId DESC
				`,
			[userId, userId]
		)

		return c.json({ cards })
	} catch (error) {
		throw rethrowWithMessage("Failed to fetch Ongeki cards", error)
	}
})

export { OngekiCardsRoutes }
