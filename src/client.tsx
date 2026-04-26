import React, { Suspense } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom"

import { Toaster } from "@/app/shared/components/ui/sonner"

import { OngekiAllSongs } from "./app/features/ongeki/pages/allsongs"
import OngekiLeaderboard from "./app/features/ongeki/pages/leaderboard"
import { OngekiRatingFrames } from "./app/features/ongeki/pages/rating"
import { OngekiRivals } from "./app/features/ongeki/pages/rivals"
import { OngekiScorePage } from "./app/features/ongeki/pages/scores"
import { OngekiSettingsPage } from "./app/features/ongeki/pages/settings"
import OngekiCards from "./app/features/ongeki/pages/cards"
import WelcomePage, { WelcomeContent } from "./app/features/public/welcome-page"
import { AccentColorProvider } from "./app/shared/components/accent-color-provider"
import { LoginContent } from "./app/shared/components/common/login"
import { SidebarComponent } from "./app/shared/components/common/sidebar"
import { SignUpContent } from "./app/shared/components/common/signup"
import { ThemeProvider } from "./app/shared/components/theme-provider"
import { SidebarProvider } from "./app/shared/components/ui/sidebar"
import { AuthProvider } from "./app/shared/context/auth"
import ServerNews from "./app/shared/pages/home-page"
import { NotFound } from "./app/shared/pages/not-found"
import { ProtectedRoute } from "./app/shared/utils/protected"
import "./index.css"

// Lazy-load large pages and feature components to reduce initial bundle size
const Account = React.lazy(() => import("./app/features/account/pages/account"))
const ProfilePage = React.lazy(() => import("./app/features/account/pages/profile"))
const AdminDashboard = React.lazy(() => import("./app/features/admin/pages/admin-dashboard"))
const AdminUsers = React.lazy(() => import("./app/features/admin/pages/admin-users"))
const AdminIcfEditor = React.lazy(() => import("./app/features/admin/pages/admin-icf-editor"))
const ChunithmAllSongs = React.lazy(() => import("./app/features/chunithm/pages/allsongs"))
const ChunithmFavorites = React.lazy(() => import("./app/features/chunithm/pages/favorites"))
const ChunithmLeaderboard = React.lazy(() => import("./app/features/chunithm/pages/leaderboard"))
const ChunithmProfile = React.lazy(() => import("./app/features/chunithm/pages/profile"))
const ChunithmRatingBaseList = React.lazy(() => import("./app/features/chunithm/pages/rating"))
const ChunithmRivals = React.lazy(() => import("./app/features/chunithm/pages/rivals"))
const ChunithmScorePage = React.lazy(() => import("./app/features/chunithm/pages/scores"))
const ChunithmSettingsPage = React.lazy(() => import("./app/features/chunithm/pages/settings"))
const ChunithmSongLeaderboard = React.lazy(() => import("./app/features/chunithm/pages/song-leaderboard"))
const ChunithmUserbox = React.lazy(() => import("./app/features/chunithm/pages/userbox"))
const OngekiProfile = React.lazy(() => import("./app/features/ongeki/pages/profile"))
const OngekiSongLeaderboard = React.lazy(() => import("./app/features/ongeki/pages/song-leaderboard"))
const OngekiUserbox = React.lazy(() => import("./app/features/ongeki/pages/userbox"))

const queryClient = new QueryClient()

const app = (
	<QueryClientProvider client={queryClient}>
		<BrowserRouter>
			<AuthProvider>
				<ThemeProvider>
					<AccentColorProvider>
						<Toaster />
						<Suspense fallback={<div className="bg-background" />}>
							<Routes>
								<Route path="/" element={<WelcomePage />}>
									<Route index element={<WelcomeContent />} />
									<Route path="/signup" element={<SignUpContent />} />
									<Route path="/login" element={<LoginContent />} />
								</Route>
								{/* Protected routes with sidebar */}
								<Route element={<ProtectedRoute />}>
									<Route
										element={
											<div className="bg-background text-foreground flex h-screen overflow-hidden">
												<SidebarProvider>
													<SidebarComponent />
													<div className="flex flex-1 flex-col overflow-hidden">
														<Outlet />
													</div>
												</SidebarProvider>
											</div>
										}
									>
										<Route path="/home" element={<ServerNews />} />
										<Route path="/profile" element={<ProfilePage />} />
										<Route path="/admin" element={<AdminDashboard />} />
										<Route path="/admin/users" element={<AdminUsers />} />
										<Route path="/admin/icf" element={<AdminIcfEditor />} />
										<Route path="/account" element={<Account />} />

										<Route path="/chunithm/settings" element={<ChunithmSettingsPage />} />
										<Route path="/chunithm/userbox" element={<ChunithmUserbox />} />
										<Route path="/chunithm/scores" element={<ChunithmScorePage />} />
										<Route path="/chunithm/favorites" element={<ChunithmFavorites />} />
										<Route path="/chunithm/favorites/:songId" element={<ChunithmFavorites />} />
										<Route path="/chunithm/leaderboard" element={<ChunithmLeaderboard />} />
										<Route path="/chunithm/song-leaderboard/:musicId/:chartId" element={<ChunithmSongLeaderboard />} />
										<Route path="/chunithm/allsongs" element={<ChunithmAllSongs />} />
										<Route path="/chunithm/rivals" element={<ChunithmRivals />} />
										<Route path="/chunithm/rating" element={<ChunithmRatingBaseList />} />
										<Route path="/chunithm/profile" element={<ChunithmProfile />} />

										<Route path="/ongeki/settings" element={<OngekiSettingsPage />} />
										<Route path="/ongeki/userbox" element={<OngekiUserbox />} />
										<Route path="/ongeki/allsongs" element={<OngekiAllSongs />} />
										<Route path="/ongeki/scores" element={<OngekiScorePage />} />
										<Route path="/ongeki/cards" element={<OngekiCards />} />
										<Route path="/ongeki/rating" element={<OngekiRatingFrames />} />
										<Route path="/ongeki/leaderboard" element={<OngekiLeaderboard />} />
										<Route path="/ongeki/song-leaderboard/:musicId/:chartId" element={<OngekiSongLeaderboard />} />
										<Route path="/ongeki/rivals" element={<OngekiRivals />} />
										<Route path="/ongeki/profile" element={<OngekiProfile />} />
									</Route>
								</Route>

								<Route path="*" element={<NotFound />} />
							</Routes>
						</Suspense>
					</AccentColorProvider>
				</ThemeProvider>
			</AuthProvider>
		</BrowserRouter>
	</QueryClientProvider>
)

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(env.USE_REACT_STRICT ? <React.StrictMode>{app}</React.StrictMode> : app)
