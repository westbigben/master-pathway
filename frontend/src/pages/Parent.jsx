import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Clock, Target, BookOpen, Swords, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

export default function Parent() {
    const { user, refresh } = useAuth();
    const [data, setData] = useState(null);
    const [email, setEmail] = useState("");
    const [linking, setLinking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user?.linked_student_id) {
            setLoading(false);
            return;
        }
        fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.linked_student_id]);

    const fetch = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/parent/dashboard");
            setData(data);
        } catch (e) {
            setError(e.response?.data?.detail || "Could not load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const link = async (e) => {
        e.preventDefault();
        setLinking(true);
        try {
            await api.post("/auth/link-student", { student_email: email });
            toast.success("Student linked.");
            await refresh();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Could not link student");
        } finally {
            setLinking(false);
        }
    };

    if (!user) return null;

    if (!user.linked_student_id) {
        return (
            <div className="max-w-xl mx-auto px-4 md:px-8 py-14">
                <p className="eyebrow">Parent Portal</p>
                <h1 className="font-serif text-4xl md:text-5xl mt-2">Link your student.</h1>
                <p className="mt-4 text-muted-foreground">Enter your child&rsquo;s student account email to see their training, progress, and common mistakes.</p>
                <form onSubmit={link} className="mt-8 space-y-4" data-testid="link-student-form">
                    <div className="space-y-2">
                        <Label htmlFor="student_email" className="font-mono uppercase text-xs tracking-widest">Student email</Label>
                        <Input id="student_email" data-testid="student-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-sm h-11" />
                    </div>
                    <Button type="submit" disabled={linking} className="rounded-sm font-mono uppercase text-xs tracking-widest h-11 px-6" data-testid="link-student-btn">
                        {linking ? "Linking..." : "Link student"}
                    </Button>
                </form>
            </div>
        );
    }

    if (loading) {
        return <div className="min-h-[60vh] grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>;
    }
    if (error) return <div className="p-10 text-destructive">{error}</div>;
    if (!data) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
            <p className="eyebrow">Parent Dashboard</p>
            <h1 className="font-serif text-4xl md:text-5xl mt-2">
                {data.student.name}&rsquo;s <span className="italic text-accent">journey</span>.
            </h1>
            <p className="mt-3 text-muted-foreground">{data.encouragement_note}</p>

            <div className="mt-10 grid md:grid-cols-4 gap-4">
                <Stat icon={Flame} label="Streak" value={`${data.student.streak} day${data.student.streak === 1 ? "" : "s"}`} />
                <Stat icon={Clock} label="14-day minutes" value={data.training_minutes_14d} />
                <Stat icon={Target} label="Tactical accuracy" value={`${data.tactical_accuracy}%`} />
                <Stat icon={Swords} label="Rating" value={data.student.rating} suffix={data.student.title} />
            </div>

            <div className="mt-10 grid md:grid-cols-12 gap-6">
                <div className="md:col-span-8 study-card">
                    <p className="eyebrow">Daily training minutes · 14 days</p>
                    <div className="h-64 mt-4">
                        <ResponsiveContainer>
                            <BarChart data={data.daily_minutes_series}>
                                <CartesianGrid strokeDasharray="2 4" vertical={false} className="opacity-30" />
                                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                                <YAxis tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                                <Tooltip contentStyle={{ borderRadius: 2, borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }} />
                                <Bar dataKey="minutes" fill="hsl(var(--accent))" radius={0} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="md:col-span-4 space-y-6">
                    <div className="study-card">
                        <p className="eyebrow">Common mistakes</p>
                        {data.common_mistake_motifs.length === 0 ? (
                            <p className="text-sm text-muted-foreground mt-4">No recurring pattern yet. Good.</p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {data.common_mistake_motifs.map((m) => (
                                    <li key={m.motif} className="flex justify-between text-sm" data-testid={`mistake-${m.motif}`}>
                                        <span className="capitalize">{m.motif.replace(/_/g, " ")}</span>
                                        <span className="font-mono">{m.count}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="study-card">
                        <p className="eyebrow">Progress</p>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li className="flex justify-between"><span>Puzzles solved (14d)</span><span className="font-mono">{data.puzzles_solved_14d}</span></li>
                            <li className="flex justify-between"><span>Attempts (14d)</span><span className="font-mono">{data.puzzle_attempts_14d}</span></li>
                            <li className="flex justify-between"><span>Lessons completed</span><span className="font-mono">{data.lessons_completed}</span></li>
                            <li className="flex justify-between"><span>Games played</span><span className="font-mono">{data.games_played}</span></li>
                            <li className="flex justify-between"><span>XP</span><span className="font-mono">{data.student.xp}</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stat({ icon: Icon, label, value, suffix }) {
    return (
        <div className="study-card">
            <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <p className="eyebrow mt-3">{label}</p>
            <p className="font-serif text-3xl mt-1">{value}</p>
            {suffix && <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mt-1">{suffix}</p>}
        </div>
    );
}
