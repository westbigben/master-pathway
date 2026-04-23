import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Chess } from "chess.js";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Board from "@/components/Board";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, RefreshCw, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const MOTIF_LABELS = {
    all: "All motifs",
    back_rank: "Back-rank mates",
    mate_in_1: "Mate in 1",
    mate_in_2: "Mate in 2",
    mate_in_3: "Mate in 3",
    fork: "Forks",
    pin: "Pins",
    skewer: "Skewers",
    discovered_attack: "Discovered attacks",
    deflection: "Deflection",
    clearance: "Clearance",
    sacrifice: "Sacrifices",
    endgame: "Endgames",
};

export default function Tactics() {
    const { refresh } = useAuth();
    const [params, setParams] = useSearchParams();
    const motif = params.get("motif") || "all";

    const [motifs, setMotifs] = useState([]);
    const [puzzles, setPuzzles] = useState([]);
    const [idx, setIdx] = useState(0);
    const [chess, setChess] = useState(() => new Chess());
    const [solutionIdx, setSolutionIdx] = useState(0);
    const [attempts, setAttempts] = useState(1);
    const [usedHint, setUsedHint] = useState(false);
    const [hint, setHint] = useState("");
    const [status, setStatus] = useState("idle"); // idle | wrong | solved
    const startTime = useRef(Date.now());

    const puzzle = puzzles[idx];
    const orientation = useMemo(() => {
        if (!puzzle) return "white";
        return puzzle.fen.split(" ")[1] === "w" ? "white" : "black";
    }, [puzzle]);

    useEffect(() => {
        api.get("/puzzles/motifs").then(({ data }) => setMotifs(data));
    }, []);

    useEffect(() => {
        setStatus("idle");
        setIdx(0);
        api.get("/puzzles", { params: { motif, limit: 20 } }).then(({ data }) => {
            setPuzzles(data);
        });
    }, [motif]);

    useEffect(() => {
        if (!puzzle) return;
        setChess(new Chess(puzzle.fen));
        setSolutionIdx(0);
        setAttempts(1);
        setUsedHint(false);
        setHint("");
        setStatus("idle");
        startTime.current = Date.now();
    }, [puzzle]);

    const tryMove = (src, dst) => {
        if (!puzzle || status === "solved") return false;

        const expected = puzzle.solution[solutionIdx];
        const expectedFrom = expected.slice(0, 2);
        const expectedTo = expected.slice(2, 4);

        // Validate legal
        const c = new Chess(chess.fen());
        const mv = c.move({ from: src, to: dst, promotion: "q" });
        if (!mv) return false;

        if (src === expectedFrom && dst === expectedTo) {
            setChess(c);
            const nextIdx = solutionIdx + 1;
            if (nextIdx >= puzzle.solution.length) {
                // solved
                setStatus("solved");
                void recordAttempt(true);
                toast.success("Solved. Clean work.");
            } else {
                // play opponent reply (next UCI move)
                const oppMove = puzzle.solution[nextIdx];
                setTimeout(() => {
                    const c2 = new Chess(c.fen());
                    c2.move({ from: oppMove.slice(0, 2), to: oppMove.slice(2, 4), promotion: "q" });
                    setChess(c2);
                    setSolutionIdx(nextIdx + 1);
                }, 300);
            }
            return true;
        }
        // wrong
        setAttempts((a) => a + 1);
        setStatus("wrong");
        toast("That isn't the strongest move. Retry.", { description: "Recover the position and try again." });
        setChess(new Chess(puzzle.fen));
        setSolutionIdx(0);
        return false;
    };

    const recordAttempt = async (solved) => {
        if (!puzzle) return;
        const seconds = (Date.now() - startTime.current) / 1000;
        try {
            const { data } = await api.post("/puzzles/attempt", {
                puzzle_id: puzzle.id, solved, attempts, time_seconds: seconds, used_hint: usedHint,
            });
            toast.success(`${data.rating_delta >= 0 ? "+" : ""}${data.rating_delta} rating · ${data.title}`);
            await refresh();
        } catch {}
    };

    const showHint = () => {
        if (!puzzle) return;
        setUsedHint(true);
        const m = puzzle.solution[solutionIdx];
        setHint(`Look at the piece on ${m.slice(0, 2).toUpperCase()}. It has a strong move available.`);
    };

    const next = () => {
        setIdx((i) => (i + 1 < puzzles.length ? i + 1 : 0));
    };

    const retry = () => {
        setChess(new Chess(puzzle.fen));
        setSolutionIdx(0);
        setAttempts((a) => a);
        setStatus("idle");
        setHint("");
    };

    const highlight = useMemo(() => {
        if (!puzzle || status !== "solved") return {};
        const last = puzzle.solution[puzzle.solution.length - 1];
        return {
            [last.slice(0, 2)]: { background: "rgba(212,175,55,0.35)" },
            [last.slice(2, 4)]: { background: "rgba(212,175,55,0.35)" },
        };
    }, [status, puzzle]);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <p className="eyebrow">Tactics Trainer</p>
                    <h1 className="font-serif text-4xl md:text-5xl mt-2">Sharpen the blade.</h1>
                </div>
                <div className="min-w-[220px]">
                    <Select value={motif} onValueChange={(v) => setParams({ motif: v })}>
                        <SelectTrigger data-testid="motif-select" className="rounded-sm font-mono uppercase tracking-widest text-xs h-11">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" data-testid="motif-all">All motifs</SelectItem>
                            {motifs.map((m) => (
                                <SelectItem key={m.key} value={m.key} data-testid={`motif-${m.key}`}>
                                    {MOTIF_LABELS[m.key] || m.key} · {m.count}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mt-8 grid md:grid-cols-12 gap-8">
                <div className="md:col-span-7">
                    <div className="board-frame">
                        {puzzle ? (
                            <Board position={chess.fen()} onDrop={tryMove} orientation={orientation} highlightSquares={highlight} />
                        ) : (
                            <div className="aspect-square grid place-items-center text-muted-foreground font-mono uppercase tracking-widest text-xs">Loading...</div>
                        )}
                    </div>
                </div>

                <aside className="md:col-span-5 space-y-6">
                    {puzzle ? (
                        <>
                            <div className="study-card">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="eyebrow">#{puzzle.id} · Diff {puzzle.difficulty}/5</p>
                                    <span className="stage-pill">{MOTIF_LABELS[puzzle.motif] || puzzle.motif}</span>
                                </div>
                                <h2 className="font-serif text-2xl mt-2">{puzzle.title}</h2>
                                <p className="mt-4 text-sm text-muted-foreground">
                                    {orientation === "white" ? "White" : "Black"} to move. Find the best sequence.
                                </p>

                                {status === "solved" && (
                                    <div className="mt-5 p-4 border border-accent rounded-sm bg-accent/10" data-testid="solved-panel">
                                        <p className="eyebrow text-accent">Solved</p>
                                        <p className="mt-2 text-sm">{puzzle.explanation}</p>
                                    </div>
                                )}
                                {status === "wrong" && (
                                    <p className="mt-5 text-sm text-destructive" data-testid="wrong-hint">That wasn&rsquo;t the strongest move. Reset and find the candidate.</p>
                                )}
                                {hint && <p className="mt-4 text-sm text-accent italic" data-testid="hint-text">{hint}</p>}

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <Button variant="outline" onClick={showHint} data-testid="hint-btn" className="rounded-sm font-mono uppercase text-xs tracking-widest">
                                        <Lightbulb className="h-4 w-4 mr-2" /> Hint
                                    </Button>
                                    <Button variant="outline" onClick={retry} data-testid="retry-btn" className="rounded-sm font-mono uppercase text-xs tracking-widest">
                                        <RefreshCw className="h-4 w-4 mr-2" /> Retry
                                    </Button>
                                    <Button onClick={next} data-testid="next-puzzle-btn" className="rounded-sm font-mono uppercase text-xs tracking-widest ml-auto">
                                        Next <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                            <div className="study-card">
                                <p className="eyebrow">Pedagogy</p>
                                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                    Scan for <strong>checks, captures, threats</strong> first. Visualise your opponent&rsquo;s reply before moving. Compare at least two candidates.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="study-card text-muted-foreground font-mono uppercase text-xs tracking-widest">No puzzles in this motif yet.</div>
                    )}
                </aside>
            </div>
        </div>
    );
}
