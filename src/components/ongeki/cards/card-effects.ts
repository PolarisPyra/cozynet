import { useCallback, useEffect, useRef } from "react"

import { useIsMobile } from "@/hooks/use-mobile"

// Animation constants
const ROTATION_SPEED = 0.1
const SPARKLE_SPEED = 0.4
const SPARKLE_MULTIPLIER = 1.3
const SPARKLE_MULTIPLIER_Y = 0.9
const SCAN_LINE_SPEED = 30
const TIME_INCREMENT = 0.016

// Effect constants
const GRADIENT_COUNT = 4
const SPARKLE_COUNT = 8
const SPARKLE_BASE_SIZE = 40
const SPARKLE_SIZE_VARIANCE = 20
const LINE_SPACING = 3
const HUE_ROTATION = 40
const HUE_STEP = 60
const COLOR_STOPS = [0, 0.25, 0.5, 0.75, 1] as const

// Styling constants
const MAX_ROTATION = 18
const PERSPECTIVE = 1000
const CANVAS_OPACITY_HOVER = 0.7
const CANVAS_OPACITY_DEFAULT = 0

// Shadow constants
const SHADOW_DEFAULT = "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
const SHADOW_HOVER = "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)"

interface GradientConfig {
	angle: number
	time: number
	index: number
	width: number
	height: number
}

interface SparkleConfig {
	time: number
	index: number
	width: number
	height: number
}

const createAnimatedGradient = (ctx: CanvasRenderingContext2D, config: GradientConfig) => {
	const { angle, time, index, width, height } = config
	const x1 = width / 2 + Math.cos(angle) * width
	const y1 = height / 2 + Math.sin(angle) * height
	const x2 = width / 2 - Math.cos(angle) * width
	const y2 = height / 2 - Math.sin(angle) * height

	const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
	const hueOffset = (time * HUE_ROTATION + index * 120) % 360

	COLOR_STOPS.forEach(stop => {
		const hue = (hueOffset + stop * HUE_STEP * 3) % 360
		const lightness = stop === 0.5 ? 70 : 65
		const alpha = stop === 0.5 ? 0.5 : stop === 0.25 || stop === 0.75 ? 0.4 : 0.3
		gradient.addColorStop(stop, `hsla(${hue}, 100%, ${lightness}%, ${alpha})`)
	})

	return gradient
}

const createSparkleGradient = (ctx: CanvasRenderingContext2D, config: SparkleConfig) => {
	const { time, index, width, height } = config
	const sparkleTime = time * SPARKLE_SPEED + index * 0.5
	const x = (Math.sin(sparkleTime * SPARKLE_MULTIPLIER + index) * 0.4 + 0.5) * width
	const y = (Math.cos(sparkleTime * SPARKLE_MULTIPLIER_Y + index) * 0.4 + 0.5) * height
	const size = SPARKLE_BASE_SIZE + Math.sin(sparkleTime * 2) * SPARKLE_SIZE_VARIANCE

	const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
	gradient.addColorStop(0, "rgba(255, 255, 255, 0.6)")
	gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)")
	gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

	return gradient
}

const drawScanLines = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
	const offset = (time * SCAN_LINE_SPEED) % (LINE_SPACING * 2)

	ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
	ctx.lineWidth = 1

	for (let i = -height; i < width + height; i += LINE_SPACING * 2) {
		ctx.beginPath()
		ctx.moveTo(i - offset, 0)
		ctx.lineTo(i + height - offset, height)
		ctx.stroke()
	}
}

export const drawHolographicEffect = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
	ctx.clearRect(0, 0, width, height)

	// Draw animated gradients
	for (let i = 0; i < GRADIENT_COUNT; i++) {
		const angle = (time * ROTATION_SPEED + i * 2.1) % (Math.PI * 2)
		const gradient = createAnimatedGradient(ctx, { angle, time, index: i, width, height })
		ctx.fillStyle = gradient
		ctx.fillRect(0, 0, width, height)
	}

	// Draw sparkles
	for (let i = 0; i < SPARKLE_COUNT; i++) {
		const gradient = createSparkleGradient(ctx, { time, index: i, width, height })
		ctx.fillStyle = gradient
		ctx.fillRect(0, 0, width, height)
	}

	// Draw scan lines
	drawScanLines(ctx, width, height, time)
}

interface UseCardEffectsOptions {
	enabled: boolean
	cardRef: React.RefObject<HTMLDivElement | null>
	canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export const useCardEffects = ({ enabled, cardRef, canvasRef }: UseCardEffectsOptions) => {
	const isMobile = useIsMobile()
	const boundsRef = useRef<DOMRect | null>(null)
	const rotationFrameRef = useRef<number | null>(null)
	const animationFrameRef = useRef<number | null>(null)
	const timeRef = useRef(0)

	const handleMouseEnter = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (isMobile) return
			
			const el = cardRef.current
			const canvas = canvasRef.current
			if (!el) return

			boundsRef.current = el.getBoundingClientRect()

			if (canvas) {
				canvas.style.opacity = String(CANVAS_OPACITY_HOVER)
			}

			e.currentTarget.style.boxShadow = SHADOW_HOVER
		},
		[cardRef, canvasRef, isMobile]
	)

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (isMobile) return
			
			const el = cardRef.current
			if (!el || rotationFrameRef.current !== null) return

			rotationFrameRef.current = window.requestAnimationFrame(() => {
				rotationFrameRef.current = null
				const rect = boundsRef.current ?? el.getBoundingClientRect()
				boundsRef.current = rect

				const x = e.clientX - rect.left
				const y = e.clientY - rect.top
				const cx = rect.width / 2
				const cy = rect.height / 2

				const rotateX = ((cy - y) / cy) * MAX_ROTATION
				const rotateY = ((x - cx) / cx) * MAX_ROTATION

				el.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
			})
		},
		[cardRef, isMobile]
	)

	const handleMouseLeave = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (isMobile) return
			
			const el = cardRef.current
			const canvas = canvasRef.current
			if (!el) return

			if (rotationFrameRef.current !== null) {
				cancelAnimationFrame(rotationFrameRef.current)
				rotationFrameRef.current = null
			}

			el.style.transform = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg)`
			boundsRef.current = null

			if (canvas) {
				canvas.style.opacity = String(CANVAS_OPACITY_DEFAULT)
			}

			e.currentTarget.style.boxShadow = SHADOW_DEFAULT
		},
		[cardRef, canvasRef, isMobile]
	)

	useEffect(() => {
		if (!enabled || !canvasRef.current || isMobile) return

		const canvas = canvasRef.current
		const ctx = canvas.getContext("2d", { alpha: true })
		if (!ctx) return

		const handleResize = () => {
			if (!canvas.parentElement) return
			const rect = canvas.parentElement.getBoundingClientRect()
			const dpr = window.devicePixelRatio || 1

			canvas.width = rect.width * dpr
			canvas.height = rect.height * dpr
			canvas.style.width = `${rect.width}px`
			canvas.style.height = `${rect.height}px`

			ctx.scale(dpr, dpr)
		}

		const resizeObserver = new ResizeObserver(handleResize)
		if (canvas.parentElement) {
			resizeObserver.observe(canvas.parentElement)
		}
		handleResize()

		const animate = () => {
			animationFrameRef.current = requestAnimationFrame(animate)
			timeRef.current += TIME_INCREMENT

			const displayWidth = canvas.clientWidth
			const displayHeight = canvas.clientHeight

			drawHolographicEffect(ctx, displayWidth, displayHeight, timeRef.current)
		}

		animate()

		return () => {
			resizeObserver.disconnect()
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current)
				animationFrameRef.current = null
			}
		}
	}, [enabled, canvasRef, isMobile])

	return {
		handleMouseEnter,
		handleMouseMove,
		handleMouseLeave
	}
}

export const getCardStyles = () => ({
	backfaceVisibility: "hidden" as const,
	WebkitBackfaceVisibility: "hidden" as const,
	transformStyle: "preserve-3d" as const,
	perspective: "1200px",
	boxShadow: SHADOW_DEFAULT
})

export const getCanvasStyles = () => ({
	mixBlendMode: "screen" as const,
	opacity: CANVAS_OPACITY_DEFAULT
})
