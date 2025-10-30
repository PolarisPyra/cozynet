import { Hono } from "hono";
import type { RowDataPacket } from "mysql2";

import { db } from "@/api/db";
import { rethrowWithMessage } from "@/api/utils/error";
import type { DB } from "@/shared/types";

const OngekiCardsRoutes = new Hono().get("/", async (c) => {
	try {
		const { userId } = c.payload;

		// Return the full static card list, with any matching user card data (if owned)
		// This ensures users with global unlocks still see all cards even if not explicitly acquired
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
		WHERE sc.imagePath IS NOT NULL
		ORDER BY sc.cardId DESC
				`,
			[userId]
		);

		return c.json({ cards });
	} catch (error) {
		throw rethrowWithMessage("Failed to fetch Ongeki cards", error);
	}
});

export { OngekiCardsRoutes };
