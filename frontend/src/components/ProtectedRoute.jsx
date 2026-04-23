import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, role }) {
    const { user, booting } = useAuth();
    if (booting) {
        return (
            <div className="min-h-screen grid place-items-center bg-background text-muted-foreground font-mono text-xs uppercase tracking-widest">
                Checking session...
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
    return children;
}
