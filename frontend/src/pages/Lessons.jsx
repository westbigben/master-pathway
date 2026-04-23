import { useEffect, useState } from "react";
import api from "@/lib/api";
import Board from "@/components/Board";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Chess } from "chess.js";

export default function Lessons() {
    const [lessons, setLessons] = useState([]);
    const [active, setActive] = useState(null);

    useEffect(() => {
        api.get("/lessons").then(({ data }) => setLessons(data));
    }, []);

    const complete = async (lesson) => {
        try {
            await api.post("/lessons/complete", { lesson_id: lesson.id });
            toast.success(`Lesson complete. +25 XP.`);
        } catch {
            toast.error("Could not mark as complete.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
            <p className="eyebrow">Lesson Engine</p>
            <h1 className="font-serif text-4xl md:text-5xl mt-2">Understand, then remember.</h1>

            {active ? (
                <LessonDetail lesson={active} onBack={() => setActive(null)} onComplete={() => complete(active)} />
            ) : (
                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {lessons.map((l) => (
                        <button
                            key={l.id}
                            onClick={() => setActive(l)}
                            data-testid={`lesson-${l.id}`}
                            className="study-card text-left hover:border-accent transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <span className="stage-pill">Stage {l.stage}</span>
                                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {l.minutes} min
                                </span>
                            </div>
                            <h3 className="font-serif text-2xl mt-3">{l.title}</h3>
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{l.summary}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function LessonDetail({ lesson, onBack, onComplete }) {
    // validate FEN to avoid render crash
    let fen = lesson.demo_fen;
    try { new Chess(fen); } catch { fen = "start"; }

    return (
        <div className="mt-10 grid md:grid-cols-12 gap-8">
            <div className="md:col-span-7">
                <div className="board-frame">
                    <Board position={fen} allowDrag={false} />
                </div>
                <p className="eyebrow mt-3">Position from lesson</p>
            </div>
            <div className="md:col-span-5 space-y-6">
                <div className="study-card">
                    <button onClick={onBack} data-testid="back-to-lessons" className="font-mono uppercase text-xs tracking-widest text-muted-foreground hover:text-foreground">← All lessons</button>
                    <div className="flex items-center justify-between mt-3">
                        <span className="stage-pill">Stage {lesson.stage}</span>
                        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{lesson.minutes} min</span>
                    </div>
                    <h2 className="font-serif text-3xl mt-4">{lesson.title}</h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed">{lesson.summary}</p>
                </div>
                <div className="study-card">
                    <p className="eyebrow">Key points</p>
                    <ul className="mt-4 space-y-3">
                        {lesson.key_points.map((p, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                                <span>{p}</span>
                            </li>
                        ))}
                    </ul>
                    <Button onClick={onComplete} data-testid="complete-lesson-btn" className="mt-6 w-full rounded-sm font-mono uppercase text-xs tracking-widest">
                        Mark complete
                    </Button>
                </div>
            </div>
        </div>
    );
}
