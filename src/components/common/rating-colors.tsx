import React from "react";

const getChunithmRatingTier = (rating: number): number => {
	const thresholds = [
		[17.0, 9],
		[15.0, 8],
		[14.5, 7],
		[14.0, 6],
		[13.0, 5],
		[12.0, 4],
		[10.0, 3],
		[7.0, 2],
		[4.0, 1],
	] as const;

	for (const [threshold, tier] of thresholds) {
		if (rating >= threshold) return tier;
	}
	return 0;
};

const getChunithmRatingStyle = (tier: number): React.CSSProperties => {
	const styles: Record<number, React.CSSProperties> = {
		0: {
			color: "#00d747",
		},
		1: {
			color: "#ef9d00",
		},
		2: {
			color: "#ef2d00",
		},
		3: {
			color: "#ba00ef",
		},
		4: {
			background: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)",
		},
		5: {
			background: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)",
		},
		6: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
		7: {
			background: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
		8: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
		9: {
			background: "linear-gradient(to bottom, #FFFF00 25%, #FF1493 40%, #0066FF 60%, #00E5CC 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
	};

	return styles[tier] || styles[0];
};

const getOngekiRatingTierOld = (rating: number): number => {
	const thresholds = [
		[16.0, 8],
		[15.25, 7],
		[14.5, 6],
		[13.25, 5],
		[12.0, 4],
		[10.0, 3],
		[7.0, 2],
		[4.0, 1],
	] as const;

	for (const [threshold, tier] of thresholds) {
		if (rating >= threshold) return tier;
	}
	return 0;
};

const getOngekiRatingTierRefresh = (rating: number): number => {
	const thresholds = [
		[21.0, 11],
		[20.0, 10],
		[19.0, 9],
		[18.0, 8],
		[17.0, 7],
		[15.0, 6],
		[13.0, 5],
		[11.0, 4],
		[9.0, 3],
		[7.0, 2],
		[4.0, 1],
	] as const;

	for (const [threshold, tier] of thresholds) {
		if (rating >= threshold) return tier;
	}
	return 0;
};

export const ChunithmRatingColors: React.FC<{ rating: number }> = ({ rating }) => {
	const ratingString = rating.toFixed(2);
	const tier = getChunithmRatingTier(rating);
	const style = getChunithmRatingStyle(tier);

	return (
		<span key={`chunithm-${tier}`} className="font-bold" style={style}>
			{ratingString}
		</span>
	);
};

const getOngekiRatingStyleOld = (tier: number): React.CSSProperties => {
	const styles: Record<number, React.CSSProperties> = {
		0: {
			color: "#00d747",
		},
		1: {
			color: "#ef9d00",
		},
		2: {
			color: "#ef2d00",
		},
		3: {
			color: "#ba00ef",
		},
		4: {
			background: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)",
		},
		5: {
			background: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)",
		},
		6: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
		7: {
			background: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
		8: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
	};

	return styles[tier] || styles[0];
};

const getOngekiRatingStyleRefresh = (tier: number): React.CSSProperties => {
	const styles: Record<number, React.CSSProperties> = {
		0: {
			color: "#00b6bd",
		},
		1: {
			color: "#00d747",
		},
		2: {
			color: "#ef9d00",
		},
		3: {
			color: "#ef2d00",
		},
		4: {
			color: "#ba00ef",
		},
		5: {
			background: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)",
		},
		6: {
			background: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)",
		},
		7: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
		8: {
			background: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
		9: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
		10: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			filter: "drop-shadow(0 0 2px rgba(247, 254, 18, 0.4)) drop-shadow(0 0 4px rgba(0, 255, 255, 0.3))",
		},
		11: {
			background: "linear-gradient(135deg, #f7fe12 0%, #00ffff 50%, #fe70d3 100%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
		},
	};

	return styles[tier] || styles[0];
};

export const OngekiRatingColors: React.FC<{ rating: number; decimals?: number; isRefresh?: boolean }> = ({
	rating,
	decimals = 2,
	isRefresh = false,
}) => {
	const ratingString = rating.toFixed(decimals);
	const tier = isRefresh ? getOngekiRatingTierRefresh(rating) : getOngekiRatingTierOld(rating);
	const style = isRefresh ? getOngekiRatingStyleRefresh(tier) : getOngekiRatingStyleOld(tier);

	return (
		<span key={`ongeki-${isRefresh ? "refresh" : "old"}-${tier}`} className="font-bold" style={style}>
			{ratingString}
		</span>
	);
};
