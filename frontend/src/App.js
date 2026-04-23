import { useEffect, useState } from "react";
import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Roadmap from "@/pages/Roadmap";
import Tactics from "@/pages/Tactics";
import Lessons from "@/pages/Lessons";
import Play from "@/pages/Play";
import Coach from "@/pages/Coach";
import Parent from "@/pages/Parent";
import TournamentPrep from "@/pages/TournamentPrep";

function Home() {
    const { user, booting } = useAuth();
    if (booting) return null;
    if (!user) return <Landing />;
    return <Navigate to={user.role === "parent" ? "/parent" : "/dashboard"} replace />;
}

function AppShell({ children }) {
    return <Layout>{children}</Layout>;
}

export default function App() {
    // ensure no hash-route weirdness
    useEffect(() => { document.title = "Chess Master Journey"; }, []);
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Toaster position="top-center" />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/dashboard" element={<ProtectedRoute role="student"><AppShell><Dashboard /></AppShell></ProtectedRoute>} />
                        <Route path="/roadmap" element={<ProtectedRoute role="student"><AppShell><Roadmap /></AppShell></ProtectedRoute>} />
                        <Route path="/tactics" element={<ProtectedRoute role="student"><AppShell><Tactics /></AppShell></ProtectedRoute>} />
                        <Route path="/lessons" element={<ProtectedRoute role="student"><AppShell><Lessons /></AppShell></ProtectedRoute>} />
                        <Route path="/play" element={<ProtectedRoute role="student"><AppShell><Play /></AppShell></ProtectedRoute>} />
                        <Route path="/coach" element={<ProtectedRoute role="student"><AppShell><Coach /></AppShell></ProtectedRoute>} />
                        <Route path="/tournament" element={<ProtectedRoute role="student"><AppShell><TournamentPrep /></AppShell></ProtectedRoute>} />

                        <Route path="/parent" element={<ProtectedRoute role="parent"><AppShell><Parent /></AppShell></ProtectedRoute>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}
