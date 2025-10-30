import type { CardFilter } from "../types/card-types";

// Skill category mapping removed; category filter disabled

export const rarityFilter: CardFilter = {
	identifier: "rarity",
	label: "Rarity",
	options: [
		{ label: "All", value: "all" },
		{ label: "SSR", value: "3" },
		{ label: "SR+", value: "12" },
		{ label: "SR", value: "2" },
		{ label: "R", value: "1" },
		{ label: "N", value: "0" },
	],
	isRequired: true,
	predicate: (card, value) => {
		if (value === "all") return true;
		const rarityValue = parseInt(value);
		return card.rarity === rarityValue;
	},
};

export const attributeFilter: CardFilter = {
	identifier: "attribute",
	label: "Attribute",
	options: [
		{ label: "All", value: "all" },
		{ label: "Fire", value: "Fire" },
		{ label: "Aqua", value: "Aqua" },
		{ label: "Leaf", value: "Leaf" },
	],
	predicate: (card, value) => {
		if (value === "all") return true;
		return card.attribute === value;
	},
};

export const acquisitionFilter: CardFilter = {
	identifier: "acquisition",
	label: "Acquisition Status",
	options: [
		{ label: "All", value: "all" },
		{ label: "Acquired", value: "acquired" },
		{ label: "Not Acquired", value: "not_acquired" },
	],
	predicate: (card, value) => {
		if (value === "all") return true;
		if (value === "acquired") return card.isAcquired === 1;
		if (value === "not_acquired") return card.isAcquired === 0;
		return true;
	},
};

export const levelFilter: CardFilter = {
	identifier: "level",
	label: "Level Range",
	options: [
		{ label: "All", value: "all" },
		{ label: "Max Level", value: "max" },
		{ label: "Level 1-10", value: "1-10" },
		{ label: "Level 11-20", value: "11-20" },
		{ label: "Level 21-30", value: "21-30" },
		{ label: "Level 31+", value: "31+" },
	],
	predicate: (card, value) => {
		if (value === "all") return true;
		if (!card.level) return false;

		switch (value) {
			case "max":
				return card.level === card.maxLevel;
			case "1-10":
				return card.level >= 1 && card.level <= 10;
			case "11-20":
				return card.level >= 11 && card.level <= 20;
			case "21-30":
				return card.level >= 21 && card.level <= 30;
			case "31+":
				return card.level >= 31;
			default:
				return true;
		}
	},
};
export const cardFilters: CardFilter[] = [rarityFilter, attributeFilter, acquisitionFilter, levelFilter];
