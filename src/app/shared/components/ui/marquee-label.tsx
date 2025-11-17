import React, { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/app/shared/utils/cn"

interface MarqueeLabelProps {
	text: string
	className?: string
	style?: React.CSSProperties
}

export function MarqueeLabel({ text, className, style }: MarqueeLabelProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const textRef = useRef<HTMLSpanElement>(null)
	const [isOverflowing, setIsOverflowing] = useState(false)
	const [isHovered, setIsHovered] = useState(false)
	const [scrollDistance, setScrollDistance] = useState(0)

	useEffect(() => {
		const checkOverflow = () => {
			if (containerRef.current && textRef.current) {
				const containerWidth = containerRef.current.offsetWidth
				const textWidth = textRef.current.scrollWidth
				const overflowing = textWidth > containerWidth
				setIsOverflowing(overflowing)

				if (overflowing) {
					// Calculate exact distance needed to reveal all hidden text
					const exactDistance = textWidth - containerWidth + 5 // Small padding for visual comfort
					setScrollDistance(exactDistance)
				}
			}
		}

		// Use a slight delay to ensure DOM is fully rendered
		const timer = setTimeout(checkOverflow, 10)

		window.addEventListener("resize", checkOverflow)
		return () => {
			clearTimeout(timer)
			window.removeEventListener("resize", checkOverflow)
		}
	}, [text])

	const handleMouseEnter = () => setIsHovered(true)
	const handleMouseLeave = () => setIsHovered(false)

	// Calculate animation duration based on scroll distance for constant speed
	const animationDuration = useMemo(() => {
		if (!isOverflowing) return 0
		// Faster speed: 40px per second for quicker back-and-forth motion
		return Math.max(2, scrollDistance / 40)
	}, [isOverflowing, scrollDistance])

	return (
		<div
			ref={containerRef}
			className={cn("relative overflow-hidden", className)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={style}
		>
			<span
				ref={textRef}
				className={cn("block font-medium whitespace-nowrap", !isOverflowing && "truncate")}
				style={{
					...style,
					...(isOverflowing &&
						isHovered &&
						({
							animation: `marquee ${animationDuration}s linear infinite`,
							animationFillMode: "both",
							"--scroll-distance": `-${scrollDistance}px`
						} as React.CSSProperties & { "--scroll-distance"?: string }))
				}}
			>
				{text}
			</span>
			<style>{`
				@keyframes marquee {
					0%,
					10% {
						transform: translateX(0);
					}
					45%,
					55% {
						transform: translateX(var(--scroll-distance));
					}
					90%,
					100% {
						transform: translateX(0);
					}
				}
			`}</style>
		</div>
	)
}
