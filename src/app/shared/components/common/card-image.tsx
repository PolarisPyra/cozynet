import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { useImageLoading } from "@/app/shared/hooks/use-image-loading"

interface CardImageProps {
	src: string
	alt: string
	width?: number
	height?: number
	className?: string
}

export function CardImage({ src, alt, width = 64, height = 64, className = "" }: CardImageProps) {
	const { imageLoaded, onImageLoad } = useImageLoading()

	return (
		<div className={`relative h-16 w-16 flex-shrink-0 ${className}`}>
			{!imageLoaded && <Skeleton className="absolute inset-0 rounded-sm" />}
			<img
				width={width}
				height={height}
				src={src}
				alt={alt}
				className="h-16 w-16 flex-shrink-0 rounded-sm object-cover"
				onLoad={onImageLoad}
				style={{ display: imageLoaded ? "block" : "none" }}
			/>
		</div>
	)
}
