import React, { Suspense } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom"

import { Toaster } from "@/components/ui/sonner"

import { Avatar } from "./components/chunithm/userbox/avatar"
import { CharacterCustomization } from "./components/chunithm/userbox/character"
import { MapiconCustomization } from "./components/chunithm/userbox/map-icon"
import { NameplateCustomization } from "./components/chunithm/userbox/nameplate"
import { StageCustomization } from "./components/chunithm/userbox/stage"
import { SystemvoiceCustomization } from "./components/chunithm/userbox/system-voice"
import { TrophyCustomization } from "./components/chunithm/userbox/trophies"
import { UserboxLayout } from "./components/chunithm/userbox/userbox-layout"
import { LoginContent } from "./components/common/login"
import { SidebarComponent } from "./components/common/sidebar"
import { SignUpContent } from "./components/common/signup"
import { ThemeProvider } from "./components/theme-provider"
import { SidebarProvider } from "./components/ui/sidebar"
import { AuthProvider } from "./context/auth"
import "./index.css"
import ServerNews from "./pages/common/home-page"
import { NotFound } from "./pages/common/not-found"
import { MaimaiDxAllSongs } from "./pages/maimaidx/allsongs"
import { MaimaiDxScorePage } from "./pages/maimaidx/scores"
import { MaimaiDxSettings } from "./pages/maimaidx/settings"
import { OngekiAllSongs } from "./pages/ongeki/allsongs"
import { CardManagement } from "./pages/ongeki/cards"
import { OngekiLeaderboard } from "./pages/ongeki/leaderboard"
import { OngekiRatingFrames } from "./pages/ongeki/rating"
import { OngekiRivals } from "./pages/ongeki/rivals"
import { OngekiScorePage } from "./pages/ongeki/scores"
import { OngekiSettingsPage } from "./pages/ongeki/settings"
import WelcomePage, { WelcomeContent } from "./pages/public/welcome-page"
import { ProtectedRoute } from "./utils/protected"

// Lazy-load large pages and feature components to reduce initial bundle size
const Account = React.lazy(() => import("./pages/account/account"))
const ChunithmAllSongs = React.lazy(() => import("./pages/chunithm/allsongs"))
const ChunithmFavorites = React.lazy(() => import("./pages/chunithm/favorites"))
const ChunithmLeaderboard = React.lazy(() => import("./pages/chunithm/leaderboard"))
const ChunithmProfile = React.lazy(() => import("./pages/chunithm/profile"))
const ChunithmRatingBaseList = React.lazy(() => import("./pages/chunithm/rating"))
const ChunithmRivals = React.lazy(() => import("./pages/chunithm/rivals"))
const ChunithmScorePage = React.lazy(() => import("./pages/chunithm/scores"))
const ChunithmSettingsPage = React.lazy(() => import("./pages/chunithm/settings"))
const OngekiProfile = React.lazy(() => import("./pages/ongeki/profile"))

const queryClient = new QueryClient()

const app = (
	<QueryClientProvider client={queryClient}>
		<BrowserRouter>
			<AuthProvider>
				<ThemeProvider>
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
									<Route path="/account" element={<Account />} />

									<Route path="/chunithm/settings" element={<ChunithmSettingsPage />} />
									<Route path="/chunithm/userbox" element={<UserboxLayout />}>
										<Route index element={<Avatar />} />
										<Route path="avatar" element={<Avatar />} />
										<Route path="character" element={<CharacterCustomization />} />
										<Route path="nameplate" element={<NameplateCustomization />} />
										<Route path="trophy" element={<TrophyCustomization />} />
										<Route path="stage" element={<StageCustomization />} />
										<Route path="systemvoice" element={<SystemvoiceCustomization />} />
										<Route path="mapicon" element={<MapiconCustomization />} />
									</Route>
									<Route path="/chunithm/scores" element={<ChunithmScorePage />} />
									<Route path="/chunithm/favorites" element={<ChunithmFavorites />} />
									<Route path="/chunithm/leaderboard" element={<ChunithmLeaderboard />} />
									<Route path="/chunithm/allsongs" element={<ChunithmAllSongs />} />
									<Route path="/chunithm/rivals" element={<ChunithmRivals />} />
									<Route path="/chunithm/rating" element={<ChunithmRatingBaseList />} />
									<Route path="/chunithm/profile" element={<ChunithmProfile />} />

									<Route path="/ongeki/settings" element={<OngekiSettingsPage />} />
									<Route path="/ongeki/allsongs" element={<OngekiAllSongs />} />
									<Route path="/ongeki/scores" element={<OngekiScorePage />} />
									<Route path="/ongeki/rating" element={<OngekiRatingFrames />} />
									<Route path="/ongeki/rating" element={<OngekiRatingFrames />} />
									<Route path="/ongeki/leaderboard" element={<OngekiLeaderboard />} />
									<Route path="/ongeki/rivals" element={<OngekiRivals />} />
									<Route path="/ongeki/cards" element={<CardManagement />} />
									<Route path="/ongeki/profile" element={<OngekiProfile />} />
									<Route path="/maimaidx/scores" element={<MaimaiDxScorePage />} />
									<Route path="/maimaidx/settings" element={<MaimaiDxSettings />} />
									<Route path="/maimaidx/allsongs" element={<MaimaiDxAllSongs />} />
								</Route>
							</Route>

							<Route path="*" element={<NotFound />} />
						</Routes>
					</Suspense>
				</ThemeProvider>
			</AuthProvider>
		</BrowserRouter>
	</QueryClientProvider>
)

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(env.USE_REACT_STRICT ? <React.StrictMode>{app}</React.StrictMode> : app)
