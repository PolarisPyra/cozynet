interface NewsCardProps {
	title: string
	date: string
	time: string
}

const NewsCard = ({ title, date, time }: NewsCardProps) => {
	return (
		<div className="bg-card rounded-sm p-6">
			<div className="flex items-start space-x-4">
				<div className="flex-1">
					<h2 className="text-primary text-xl font-semibold">{title}</h2>
					<div className="text-primary mt-4 flex flex-col text-sm">
						<span className="mt-1">
							{date}&nbsp;{time}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export default NewsCard
