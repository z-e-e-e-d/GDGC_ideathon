// App.tsx - Updated with Admin routes
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./utils/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Layouts
import PlayerLayout from "./components/layouts/PlayerLayout";
import OwnerLayout from "./components/layouts/OwnerLayout";
import AdminLayout from "./components/layouts/AdminLayout"; // Create this

// Player Pages
import PlayerDashboard from "./pages/player/PlayerDashboard";
import FindStadiums from "./pages/player/FindStadiums";
import Teams from "./pages/player/Teams";
import Bookings from "./pages/player/Bookings";

// Owner Pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import ManageStadiums from "./pages/owner/ManageStadiums";
import Timeline from "./pages/owner/Timeline";
import Requests from "./pages/owner/Requests";
import Analytics from "./pages/owner/Analytics";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard"; // Create this
import AdminUsers from "./pages/admin/AdminUsers"; // Create this
import AdminVerifications from "./pages/admin/AdminVerifications"; // Create this

import CaptainOnlyRoute from "./utils/captainOnlyRoute";

import OwnersManagement from "./pages/admin/OwnersManagement";

// Captain-specific pages
import CaptainDashboard from "./pages/player/CaptainDashboard";
import RegularPlayerDashboard from "./pages/player/RegularPlayerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Player Routes */}
            <Route
              path="/player"
              element={
                <ProtectedRoute allowedRoles={["player"]}>
                  <PlayerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PlayerDashboard />} />
              <Route path="stadiums" element={<FindStadiums />} />
              <Route path="teams" element={<Teams />} />
              <Route path="bookings" element={<Bookings />} />
              <Route
                path="find-players"
                element={
                  <div className="text-center py-12 text-muted-foreground">
                    Find Players - Coming Soon
                  </div>
                }
              />
              <Route
                path="captain-dashboard"
                element={
                  <CaptainOnlyRoute>
                    <CaptainDashboard />
                  </CaptainOnlyRoute>
                }
              />
              <Route
                path="regular-dashboard"
                element={<RegularPlayerDashboard />}
              />
            </Route>

            {/* Owner Routes */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <OwnerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OwnerDashboard />} />
              <Route path="stadiums" element={<ManageStadiums />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="requests" element={<Requests />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="owners" element={<OwnersManagement />} />

              {/* Add more admin routes as needed */}
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;