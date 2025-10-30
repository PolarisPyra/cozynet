import React from "react";
import { Suspense } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "./components/theme-provider";
import { SidebarProvider } from "./components/ui/sidebar";
import { AuthProvider } from "./context/auth";
import "./index.css";
import ServerNews from "./pages/common/home-page";
import WelcomePage, { WelcomeContent } from "./pages/public/welcome-page";

// Lazy-load large pages and feature components to reduce initial bundle size
const Account = React.lazy(() => import("./pages/account/account"));
const ChunithmAllSongs = React.lazy(() => import("./pages/chunithm/allsongs"));
const ChunithmFavorites = React.lazy(() => import("./pages/chunithm/favorites"));
const ChunithmLeaderboard = React.lazy(() => import("./pages/chunithm/leaderboard"));
const ChunithmRatingBaseList = React.lazy(() => import("./pages/chunithm/rating"));
const ChunithmRivals = React.lazy(() => import("./pages/chunithm/rivals"));
const ChunithmScorePage = React.lazy(() => import("./pages/chunithm/scores"));
const ChunithmSettingsPage = React.lazy(() => import("./pages/chunithm/settings"));

const Avatar = React.lazy(() => import("./components/chunithm/userbox/avatar"));
const Character = React.lazy(() => import("./components/chunithm/userbox/character"));
const MapIcon = React.lazy(() => import("./components/chunithm/userbox/map-icon"));
const Nameplate = React.lazy(() => import("./components/chunithm/userbox/nameplate"));
const Stage = React.lazy(() => import("./components/chunithm/userbox/stage"));
const SystemVoice = React.lazy(() => import("./components/chunithm/userbox/system-voice"));
const Trophies = React.lazy(() => import("./components/chunithm/userbox/trophies"));
const UserboxLayout = React.lazy(() => import("./components/chunithm/userbox/userbox-layout"));

const LoginContent = React.lazy(() => import("./components/common/login").then((m) => ({ default: m.LoginContent })));
const SidebarComponent = React.lazy(() =>
	import("./components/common/sidebar").then((m) => ({ default: m.SidebarComponent }))
);
const SignUpContent = React.lazy(() => import("./components/common/signup"));

const NotFound = React.lazy(() => import("./pages/common/not-found").then((m) => ({ default: m.NotFound })));

const Mai2ScorePage = React.lazy(() => import("./pages/maimaidx/scores"));
const MaimaiDxSettings = React.lazy(() => import("./pages/maimaidx/settings"));
const MaimaiDxAllSongs = React.lazy(() => import("./pages/maimaidx/allsongs"));

const OngekiAllSongs = React.lazy(() => import("./pages/ongeki/allsongs"));
const CardManagement = React.lazy(() => import("./pages/ongeki/cards"));
const OngekiLeaderboard = React.lazy(() => import("./pages/ongeki/leaderboard"));
const OngekiRatingFrames = React.lazy(() => import("./pages/ongeki/rating"));
const OngekiRivals = React.lazy(() => import("./pages/ongeki/rivals"));
const OngekiScorePage = React.lazy(() => import("./pages/ongeki/scores"));
const OngekiSettingsPage = React.lazy(() => import("./pages/ongeki/settings"));

const ProtectedRoute = React.lazy(() => import("./utils/protected").then((m) => ({ default: m.ProtectedRoute })));

const queryClient = new QueryClient();

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
										<Route path="character" element={<Character />} />
										<Route path="nameplate" element={<Nameplate />} />
										<Route path="trophy" element={<Trophies />} />
										<Route path="stage" element={<Stage />} />
										<Route path="systemvoice" element={<SystemVoice />} />
										<Route path="mapicon" element={<MapIcon />} />
									</Route>
									<Route path="/chunithm/scores" element={<ChunithmScorePage />} />
									<Route path="/chunithm/favorites" element={<ChunithmFavorites />} />
									<Route path="/chunithm/leaderboard" element={<ChunithmLeaderboard />} />
									<Route path="/chunithm/allsongs" element={<ChunithmAllSongs />} />
									<Route path="/chunithm/rivals" element={<ChunithmRivals />} />
									<Route path="/chunithm/rating" element={<ChunithmRatingBaseList />} />

									<Route path="/ongeki/settings" element={<OngekiSettingsPage />} />
									<Route path="/ongeki/allsongs" element={<OngekiAllSongs />} />
									<Route path="/ongeki/scores" element={<OngekiScorePage />} />
									<Route path="/ongeki/rating" element={<OngekiRatingFrames />} />
									<Route path="/ongeki/rating" element={<OngekiRatingFrames />} />
									<Route path="/ongeki/leaderboard" element={<OngekiLeaderboard />} />
									<Route path="/ongeki/rivals" element={<OngekiRivals />} />
									<Route path="/ongeki/cards" element={<CardManagement />} />
									<Route path="/maimaidx/scores" element={<Mai2ScorePage />} />
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
);

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(env.USE_REACT_STRICT ? <React.StrictMode>{app}</React.StrictMode> : app);
