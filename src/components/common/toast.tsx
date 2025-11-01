import React, { useEffect } from "react"

// lightweight CSS-based toast animation to avoid framer-motion
import { CheckCircle, XCircle } from "lucide-react"

interface ToastProps {
	message: string
	type: "success" | "error"
	onClose: () => void
	duration?: number
}

export const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
	const [visible, setVisible] = React.useState(true)

	useEffect(() => {
		const timer = setTimeout(() => {
			setVisible(false)
			// allow CSS animation to finish before calling onClose
			setTimeout(onClose, 300)
		}, duration)
		return () => clearTimeout(timer)
	}, [onClose, duration])

	if (!visible) return null

	return (
		<div className="animate-toast-fade fixed right-4 bottom-4 z-50">
			<div
				className={`flex items-center space-x-3 rounded-sm p-4 shadow-lg ${
					type === "success"
						? "border border-green-500 bg-green-600/90 backdrop-blur-sm"
						: "border border-red-500 bg-red-600/90 backdrop-blur-sm"
				}`}
			>
				{type === "success" ? (
					<CheckCircle className="h-6 w-6 text-green-100" />
				) : (
					<XCircle className="h-6 w-6 text-red-100" />
				)}
				<span className="text-sm font-medium text-gray-100">{message}</span>
			</div>
		</div>
	)
}
