import { Link } from "react-router-dom";
import { ArrowRight, Crown, Target, BookOpen, LineChart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function Landing() {
    const { user } = useAuth();
    const { theme, toggle } = useTheme();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border">
                <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center">
                    <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-accent" strokeWidth={1.5} />
                        <span className="font-serif text-xl font-semibold tracking-tight">
                            Chess Master <span className="text-accent italic">Journey</span>
                        </span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={toggle}
                            data-testid="landing-theme-toggle"
                            className="h-9 w-9 grid place-items-center border border-border rounded-sm hover:bg-secondary/60"
                        >
                            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                        {user ? (
                            <Link to="/dashboard">
                                <Button data-testid="to-dashboard-btn" className="rounded-sm font-mono uppercase tracking-widest text-xs">
                                    Open Studio
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login"><Button variant="ghost" size="sm" data-testid="landing-login" className="rounded-sm font-mono uppercase tracking-widest text-xs">Login</Button></Link>
                                <Link to="/register"><Button size="sm" data-testid="landing-register" className="rounded-sm font-mono uppercase tracking-widest text-xs">Begin</Button></Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="grain absolute inset-0" />
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center relative">
                    <div className="md:col-span-7">
                        <p className="eyebrow mb-6">The Grandmaster&rsquo;s Study · Est. 2026</p>
                        <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
                            The quiet path
                            <br />
                            from <span className="italic text-accent">first principles</span>
                            <br />
                            to tournament strength.
                        </h1>
                        <p className="mt-8 max-w-xl text-muted-foreground leading-relaxed">
                            A personal chess coaching studio built for the serious young player.
                            Tactics first. Calculation next. Endgames drilled. Strategy earned.
                            Openings — later. Thirty focused minutes a day, compounded.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-3">
                            <Link to="/register">
                                <Button data-testid="hero-begin-btn" className="rounded-sm font-mono uppercase tracking-widest text-xs h-11 px-6">
                                    Begin the Journey <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" data-testid="hero-login-btn" className="rounded-sm font-mono uppercase tracking-widest text-xs h-11 px-6">
                                    Return to Studio
                                </Button>
                            </Link>
                        </div>
                        <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
                            <Stat k="800+" v="Starting rating" />
                            <Stat k="40" v="Min daily plan" />
                            <Stat k="4" v="Stages to Master" />
                        </div>
                    </div>

                    <div className="md:col-span-5">
                        <div className="board-frame relative">
                            <img
                                src="https://images.pexels.com/photos/32602518/pexels-photo-32602518.jpeg"
                                alt="A wooden chess set in dramatic study light"
                                className="w-full aspect-square object-cover"
                            />
                        </div>
                        <p className="eyebrow mt-4 text-right">Plate 01 · The Study</p>
                    </div>
                </div>
            </section>

            {/* Pillars */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 border-t border-border">
                <p className="eyebrow">The Curriculum</p>
                <h2 className="font-serif text-3xl md:text-5xl mt-3 max-w-3xl">
                    Four stages. One disciplined arc.
                </h2>
                <div className="mt-12 grid md:grid-cols-4 gap-6">
                    {[
                        { stage: "I", name: "Foundations", text: "Board vision. Piece activity. First tactics. Opening principles — without memorising theory." },
                        { stage: "II", name: "Intermediate", text: "Pins, forks, skewers. Candidate moves. Calculation basics. Pawn structures. Basic endings." },
                        { stage: "III", name: "Competitive", text: "Positional play. Planning. Opening repertoire. Rook endings. Tournament mindset." },
                        { stage: "IV", name: "Master Track", text: "Deep calculation. Strategic themes. Game annotation. Opponent prep. Psychological resilience." },
                    ].map((s) => (
                        <div key={s.stage} className="study-card">
                            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Stage {s.stage}</p>
                            <h3 className="font-serif text-2xl mt-2">{s.name}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mt-4">{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 border-t border-border grid md:grid-cols-3 gap-10">
                <Feature icon={Target} title="Daily training plan" text="30-45 minute adaptive session: tactics, endgame drill, short lesson, play and reflect. No spam, just sharpening." />
                <Feature icon={BookOpen} title="A coach that speaks plainly" text="Short, specific feedback. One concrete lesson per mistake. No childish tone. No useless praise." />
                <Feature icon={LineChart} title="Honest measurement" text="Rating, accuracy, streak, tactical breadth. Parent dashboard so progress is visible — never imagined." />
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 border-t border-border text-center">
                <p className="eyebrow">Discipline compounds</p>
                <h2 className="font-serif text-4xl md:text-6xl mt-3 max-w-3xl mx-auto">
                    The board is waiting.
                </h2>
                <div className="mt-10">
                    <Link to="/register">
                        <Button data-testid="cta-begin-btn" className="rounded-sm font-mono uppercase tracking-widest text-xs h-11 px-8">
                            Open Your Studio
                        </Button>
                    </Link>
                </div>
            </section>

            <footer className="border-t border-border">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                    <span>Chess Master Journey</span>
                    <span>Built for the long road</span>
                </div>
            </footer>
        </div>
    );
}

function Stat({ k, v }) {
    return (
        <div>
            <div className="font-serif text-3xl">{k}</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{v}</div>
        </div>
    );
}

function Feature({ icon: Icon, title, text }) {
    return (
        <div>
            <Icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
            <h3 className="font-serif text-2xl mt-4">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">{text}</p>
        </div>
    );
}
