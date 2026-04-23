import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Circle } from "lucide-react";

export default function Roadmap() {
    const { user } = useAuth();
    const [stages, setStages] = useState([]);

    useEffect(() => {
        api.get("/roadmap").then(({ data }) => setStages(data));
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
            <p className="eyebrow">The Path</p>
            <h1 className="font-serif text-4xl md:text-6xl mt-2 tracking-tight">
                Road to <span className="italic text-accent">Master</span>.
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl">
                Four stages. Earn each title by building the habits, patterns, and judgment of the one before.
                Linear on paper, recursive in practice.
            </p>

            <div className="mt-14 relative">
                <div className="absolute left-[13px] top-2 bottom-2 w-px bg-border hidden md:block" />
                <div className="space-y-10">
                    {stages.map((s, i) => {
                        const passed = (user?.rating || 0) >= s.target_rating;
                        const current = user?.stage === s.stage;
                        return (
                            <div key={s.stage} className="relative grid md:grid-cols-12 gap-6" data-testid={`stage-${s.stage}`}>
                                <div className="md:col-span-1 flex md:block items-center gap-4">
                                    <div className={`h-7 w-7 rounded-full grid place-items-center ${passed ? "bg-accent text-accent-foreground" : current ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                                        <span className="font-serif text-sm">{s.stage}</span>
                                    </div>
                                </div>
                                <div className="md:col-span-11 study-card">
                                    <div className="flex items-start justify-between flex-wrap gap-2">
                                        <div>
                                            <p className="eyebrow">Stage {s.stage}{current && " · Active"}</p>
                                            <h2 className="font-serif text-3xl mt-1">{s.name}</h2>
                                        </div>
                                        <span className="stage-pill">Target {s.target_rating}</span>
                                    </div>
                                    <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{s.blurb}</p>
                                    <ul className="mt-6 space-y-3">
                                        {s.milestones.map((m, j) => (
                                            <li key={j} className="flex items-start gap-3 text-sm" data-testid={`milestone-${s.stage}-${j}`}>
                                                {passed ? <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" /> : <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />}
                                                <span className={passed ? "line-through text-muted-foreground" : ""}>{m}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
