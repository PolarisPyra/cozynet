import { useState } from "react"

export const useImageLoading = () => {
	const [imageLoaded, setImageLoaded] = useState(false)

	return {
		imageLoaded,
		onImageLoad: () => setImageLoaded(true)
	}
}
