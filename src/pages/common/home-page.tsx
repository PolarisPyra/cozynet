import { useMemo } from "react"

import { Bell, Calendar, Clock } from "lucide-react"
import { DateTime } from "luxon"

import Header from "@/components/common/header"

const ServerNews = () => {
	const newsBulletin = useMemo(() => {
		const utcDateString = `${env.BUILD_DATE_YEAR_MONTH_DAY} ${env.BUILD_TIME_12_HOUR}`
		const dt = DateTime.fromFormat(utcDateString, "yyyy-MM-dd h:mm a", { zone: "utc" }).toLocal()

		const localDate = dt.toFormat("MMM dd, yyyy")
		const localTime = dt.toFormat("h:mm a ZZZZ")

		return [
			{
				id: 1,
				date: localDate,
				time: localTime,
				description: "",
				level: "info"
			}
		]
	}, [])

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Server Updates" />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				<div className="bg-card border-border space-y-6 rounded-xl border p-6 shadow-sm">
					<div className="border-border flex items-center gap-3 border-b pb-4">
						<Bell className="text-card-foreground h-5 w-5" />
						<h2 className="text-card-foreground text-xl font-semibold">Latest Build</h2>
					</div>

					{newsBulletin.length === 0 ? (
						<div className="py-4 text-center">
							<h3 className="text-card-foreground text-lg font-medium">No news right now</h3>
							<p className="text-muted-foreground mt-2 text-sm">You're all caught up — check back later for updates.</p>
						</div>
					) : (
						<div className="space-y-4">
							{newsBulletin.map(item => (
								<div key={item.id}>
									<div className="flex items-start justify-between gap-4">
										<div className="text-card-foreground flex flex-1 flex-col gap-3">
											<div className="flex items-center gap-2.5">
												<Calendar className="text-muted-foreground h-5 w-5 shrink-0" />
												<span className="text-base font-medium">{item.date}</span>
											</div>
											<div className="flex items-center gap-2.5">
												<Clock className="text-muted-foreground h-5 w-5 shrink-0" />
												<span className="text-base font-medium">{item.time}</span>
											</div>
										</div>
										<span className="border-border bg-muted/50 text-card-foreground shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold">
											Build {env.BUILD_HASH}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default ServerNews
