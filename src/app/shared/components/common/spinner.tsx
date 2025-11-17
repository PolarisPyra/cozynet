interface SpinnerProps {
	size?: number
	color?: string
	className?: string
}

const Spinner = ({ size = 20, color = "currentColor", className = "" }: SpinnerProps) => {
	return (
		<div
			className={`rounded-full border-2 border-t-transparent ${className}`}
			style={{
				width: size,
				height: size,
				borderColor: color,
				borderTopColor: "transparent",
				animation: "spin 1s linear infinite"
			}}
		/>
	)
}

export default Spinner
