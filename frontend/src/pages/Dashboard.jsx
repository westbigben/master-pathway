import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Clock, BookOpen, Swords, Target, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ICONS = {
    tactics: Target, endgame: Swords, lesson: BookOpen, play: Swords, reflect: CheckCircle2,
};

export default function Dashboard() {
    const { user, refresh } = useAuth();
    const [plan, setPlan] = useState(null);
    const [roadmap, setRoadmap] = useState([]);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        api.get("/daily/plan").then(({ data }) => setPlan(data)).catch(() => {});
        api.get("/roadmap").then(({ data }) => setRoadmap(data)).catch(() => {});
    }, []);

    if (!user) return null;

    const currentStage = roadmap.find((s) => s.stage === user.stage) || roadmap[0];
    const targetRating = currentStage?.target_rating || 1000;
    const prevTarget = user.stage > 1 ? roadmap[user.stage - 2]?.target_rating || 0 : 0;
    const progressPct = Math.max(0, Math.min(100, ((user.rating - prevTarget) / Math.max(1, targetRating - prevTarget)) * 100));

    const completeToday = async () => {
        setCompleting(true);
        try {
            const { data } = await api.post("/daily/complete", { minutes_spent: 35 });
            toast.success(`Training logged. Streak: ${data.streak} day${data.streak === 1 ? "" : "s"}.`);
            await refresh();
        } catch {
            toast.error("Could not record session.");
        } finally {
            setCompleting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
            <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-8 space-y-8">
                    <div>
                        <p className="eyebrow">Today&rsquo;s Plan</p>
                        <h1 className="font-serif text-4xl md:text-5xl tracking-tight mt-2">
                            Good to see you, <span className="italic text-accent">{user.name.split(" ")[0]}</span>.
                        </h1>
                        <p className="mt-3 text-muted-foreground max-w-2xl">
                            A 35 minute session is waiting. Tactics, an endgame drill, a short lesson, a live game, then a moment of reflection.
                        </p>
                    </div>

                    <div className="study-card" data-testid="today-card">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <p className="eyebrow">Session · {plan?.date || "today"}</p>
                                <h2 className="font-serif text-3xl mt-2">{plan?.total_minutes || 40} focused minutes</h2>
                            </div>
                            <Button data-testid="complete-session-btn" onClick={completeToday} disabled={completing} className="rounded-sm font-mono uppercase text-xs tracking-widest h-11 px-6">
                                {completing ? "Logging..." : "Log session"}
                            </Button>
                        </div>

                        <div className="mt-6 grid sm:grid-cols-2 gap-4">
                            {plan?.blocks?.map((b, i) => {
                                const Icon = ICONS[b.type] || Clock;
                                const path = b.type === "tactics" ? "/tactics" : b.type === "lesson" ? "/lessons" : b.type === "play" ? "/play" : b.type === "endgame" ? "/tactics?motif=endgame" : null;
                                const inner = (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{b.minutes} min</span>
                                        </div>
                                        <h3 className="font-serif text-xl mt-3">{b.title}</h3>
                                        {b.type === "tactics" && <p className="text-xs mt-2 text-muted-foreground font-mono uppercase tracking-widest">{b.motifs?.slice(0, 3).join(" · ")}</p>}
                                        {b.type === "lesson" && <p className="text-xs mt-2 text-muted-foreground">{b.lesson?.title}</p>}
                                        {b.type === "play" && <p className="text-xs mt-2 text-muted-foreground">AI level {b.ai_level}</p>}
                                        {b.type === "reflect" && <p className="text-xs mt-2 text-muted-foreground">Review one lesson learned.</p>}
                                    </>
                                );
                                return path ? (
                                    <Link key={i} to={path} data-testid={`block-${b.type}`} className="rounded-sm border border-border p-5 hover:border-accent transition-colors">
                                        {inner}
                                        <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-accent inline-flex items-center">
                                            Enter <ArrowRight className="h-3 w-3 ml-1" />
                                        </div>
                                    </Link>
                                ) : (
                                    <div key={i} className="rounded-sm border border-border p-5 opacity-80" data-testid={`block-${b.type}`}>{inner}</div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="study-card">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <p className="eyebrow">Road to Master · Stage {user.stage}</p>
                                <h3 className="font-serif text-2xl mt-2">{currentStage?.name || "Foundations"}</h3>
                            </div>
                            <Link to="/roadmap" data-testid="roadmap-link" className="font-mono uppercase text-xs tracking-widest text-accent">
                                View roadmap →
                            </Link>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">{currentStage?.blurb}</p>
                        <div className="mt-6">
                            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                <span>{user.rating} rating</span>
                                <span>Target {targetRating}</span>
                            </div>
                            <Progress value={progressPct} className="h-1 mt-2 bg-muted" />
                        </div>
                    </div>
                </div>

                <aside className="md:col-span-4 space-y-6">
                    <div className="study-card">
                        <p className="eyebrow">Rank</p>
                        <div className="flex items-center gap-3 mt-3">
                            <Trophy className="h-6 w-6 text-accent" strokeWidth={1.5} />
                            <span className="font-serif text-2xl">{user.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-mono uppercase tracking-widest">Rating {user.rating} · XP {user.xp}</p>
                    </div>
                    <div className="study-card">
                        <p className="eyebrow">Streak</p>
                        <div className="flex items-center gap-3 mt-3">
                            <Flame className="h-6 w-6 text-accent" strokeWidth={1.5} />
                            <span className="font-serif text-2xl">{user.streak} day{user.streak === 1 ? "" : "s"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Consistency is the engine. Protect the 35-minute slot.</p>
                    </div>
                    <div className="study-card">
                        <p className="eyebrow">Quick actions</p>
                        <div className="grid gap-2 mt-3">
                            <Link to="/tactics"><Button variant="outline" className="w-full justify-start rounded-sm font-mono uppercase text-xs tracking-widest" data-testid="qa-tactics"><Target className="h-4 w-4 mr-2" />Tactics trainer</Button></Link>
                            <Link to="/play"><Button variant="outline" className="w-full justify-start rounded-sm font-mono uppercase text-xs tracking-widest" data-testid="qa-play"><Swords className="h-4 w-4 mr-2" />Play & analyse</Button></Link>
                            <Link to="/coach"><Button variant="outline" className="w-full justify-start rounded-sm font-mono uppercase text-xs tracking-widest" data-testid="qa-coach"><BookOpen className="h-4 w-4 mr-2" />Ask your coach</Button></Link>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
