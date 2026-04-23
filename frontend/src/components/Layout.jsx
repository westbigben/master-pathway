import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const studentNav = [
    { to: "/dashboard", label: "Today" },
    { to: "/roadmap", label: "Roadmap" },
    { to: "/tactics", label: "Tactics" },
    { to: "/lessons", label: "Lessons" },
    { to: "/play", label: "Play" },
    { to: "/coach", label: "Coach" },
    { to: "/tournament", label: "Prep" },
];
const parentNav = [{ to: "/parent", label: "Parent" }];

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const nav = useNavigate();

    const items = user?.role === "parent" ? parentNav : studentNav;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
                    <Link to="/dashboard" className="flex items-center gap-2" data-testid="brand-link">
                        <Crown className="h-5 w-5 text-accent" strokeWidth={1.5} />
                        <span className="font-serif text-xl font-semibold tracking-tight">
                            Chess Master <span className="text-accent italic">Journey</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 ml-8">
                        {items.map((it) => (
                            <NavLink
                                key={it.to}
                                to={it.to}
                                data-testid={`nav-${it.label.toLowerCase()}`}
                                className={({ isActive }) =>
                                    `font-mono uppercase text-xs tracking-[0.2em] px-3 py-2 border-b-2 transition-colors ${
                                        isActive
                                            ? "border-accent text-foreground"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`
                                }
                            >
                                {it.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        {user && (
                            <div className="hidden sm:flex flex-col items-end leading-tight mr-2">
                                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{user.title}</span>
                                <span className="font-serif text-sm">{user.rating}</span>
                            </div>
                        )}
                        <button
                            onClick={toggle}
                            data-testid="theme-toggle"
                            className="h-9 w-9 grid place-items-center border border-border rounded-sm hover:bg-secondary/60"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                        {user ? (
                            <Button
                                data-testid="logout-btn"
                                variant="ghost"
                                size="sm"
                                className="rounded-sm font-mono uppercase text-xs tracking-widest"
                                onClick={async () => { await logout(); nav("/login"); }}
                            >
                                <LogOut className="h-4 w-4 mr-1" /> Logout
                            </Button>
                        ) : null}
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="md:hidden border-t border-border overflow-x-auto">
                    <div className="flex">
                        {items.map((it) => (
                            <NavLink
                                key={it.to}
                                to={it.to}
                                data-testid={`nav-m-${it.label.toLowerCase()}`}
                                className={({ isActive }) =>
                                    `font-mono uppercase text-[11px] tracking-[0.18em] px-4 py-3 whitespace-nowrap border-b-2 ${
                                        isActive ? "border-accent text-foreground" : "border-transparent text-muted-foreground"
                                    }`
                                }
                            >
                                {it.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-border mt-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    <span>The Grandmaster's Study</span>
                    <span>v0.1 · Daily discipline compounds</span>
                </div>
            </footer>
        </div>
    );
}
