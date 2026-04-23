import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import Board from "@/components/Board";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pickAiMove } from "@/lib/ai";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Play() {
    const { user } = useAuth();
    const [chess, setChess] = useState(() => new Chess());
    const [fen, setFen] = useState(chess.fen());
    const [color, setColor] = useState("white");
    const [level, setLevel] = useState(2);
    const [thinking, setThinking] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [result, setResult] = useState("");
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const startNew = () => {
        const c = new Chess();
        setChess(c);
        setFen(c.fen());
        setGameOver(false);
        setResult("");
        setAnalysis(null);
        // if user chose black, AI moves first
        if (color === "black") {
            setTimeout(() => aiMove(c), 300);
        }
    };

    useEffect(() => {
        startNew();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [color]);

    const checkEnd = (c) => {
        if (c.isGameOver()) {
            setGameOver(true);
            let r = "draw";
            if (c.isCheckmate()) {
                // the side to move has been mated — opposite side won
                const winner = c.turn() === "w" ? "black" : "white";
                r = winner === color ? "win" : "loss";
            }
            setResult(r);
            return true;
        }
        return false;
    };

    const aiMove = (current) => {
        const c = new Chess(current.fen());
        setThinking(true);
        timer.current = setTimeout(() => {
            const move = pickAiMove(c.fen(), level);
            if (move) {
                c.move(move);
                setChess(c);
                setFen(c.fen());
            }
            setThinking(false);
            checkEnd(c);
        }, 250);
    };

    const onDrop = (src, dst) => {
        if (gameOver || thinking) return false;
        // only allow drag on player's turn
        const turn = chess.turn() === "w" ? "white" : "black";
        if (turn !== color) return false;

        const c = new Chess(chess.fen());
        const move = c.move({ from: src, to: dst, promotion: "q" });
        if (!move) return false;
        setChess(c);
        setFen(c.fen());
        if (!checkEnd(c)) {
            aiMove(c);
        }
        return true;
    };

    const analyze = async () => {
        setAnalyzing(true);
        try {
            const pgn = chess.pgn();
            const { data } = await api.post("/coach/analyze-game", {
                pgn,
                result: result || "draw",
                player_color: color,
                ai_level: level,
            });
            setAnalysis(data.analysis);
        } catch (e) {
            toast.error("Analysis unavailable. Try again shortly.");
        } finally {
            setAnalyzing(false);
        }
    };

    const resign = () => {
        setGameOver(true);
        setResult("loss");
    };

    const orientation = color;
    const playerTurn = (chess.turn() === "w" ? "white" : "black") === color;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
            <p className="eyebrow">Play &amp; Analyse</p>
            <h1 className="font-serif text-4xl md:text-5xl mt-2">Into the arena.</h1>

            <div className="mt-8 grid md:grid-cols-12 gap-8">
                <div className="md:col-span-7">
                    <div className="board-frame">
                        <Board position={fen} onDrop={onDrop} orientation={orientation} allowDrag={!gameOver && !thinking && playerTurn} />
                    </div>
                    <div className="mt-3 flex items-center gap-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        <span>{thinking ? <span className="inline-flex items-center"><Loader2 className="h-3 w-3 mr-2 animate-spin" /> engine thinking</span> : playerTurn && !gameOver ? "your move" : gameOver ? `game over · ${result}` : "waiting"}</span>
                    </div>
                </div>

                <aside className="md:col-span-5 space-y-6">
                    <div className="study-card">
                        <p className="eyebrow">Setup</p>
                        <div className="mt-4 grid gap-4">
                            <div>
                                <label className="font-mono uppercase text-xs tracking-widest text-muted-foreground block mb-2">Play as</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["white", "black"].map((c) => (
                                        <button key={c} onClick={() => setColor(c)} data-testid={`play-color-${c}`} className={`rounded-sm border px-3 py-2 font-mono uppercase text-xs tracking-widest ${color === c ? "border-accent bg-accent text-accent-foreground" : "border-border hover:bg-secondary"}`}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="font-mono uppercase text-xs tracking-widest text-muted-foreground block mb-2">Engine level</label>
                                <Select value={String(level)} onValueChange={(v) => setLevel(Number(v))}>
                                    <SelectTrigger data-testid="engine-level" className="rounded-sm h-10 font-mono uppercase text-xs tracking-widest"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1" data-testid="level-1">1 · Beginner (random)</SelectItem>
                                        <SelectItem value="2" data-testid="level-2">2 · Novice</SelectItem>
                                        <SelectItem value="3" data-testid="level-3">3 · Improver</SelectItem>
                                        <SelectItem value="4" data-testid="level-4">4 · Club</SelectItem>
                                        <SelectItem value="5" data-testid="level-5">5 · Sharp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-2 flex-wrap">
                            <Button onClick={startNew} variant="outline" className="rounded-sm font-mono uppercase text-xs tracking-widest" data-testid="new-game-btn">
                                <RefreshCw className="h-4 w-4 mr-2" /> New game
                            </Button>
                            {!gameOver && <Button onClick={resign} variant="outline" className="rounded-sm font-mono uppercase text-xs tracking-widest" data-testid="resign-btn">Resign</Button>}
                        </div>
                    </div>

                    {gameOver && (
                        <div className="study-card" data-testid="post-game-card">
                            <p className="eyebrow">Result · {result}</p>
                            <h3 className="font-serif text-2xl mt-2">
                                {result === "win" ? "Well earned." : result === "draw" ? "A fair split." : "Learn and continue."}
                            </h3>
                            <Button onClick={analyze} disabled={analyzing} className="mt-4 rounded-sm font-mono uppercase text-xs tracking-widest w-full" data-testid="analyze-btn">
                                {analyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analysing...</> : "Analyse with coach"}
                            </Button>
                            {analysis && (
                                <div className="mt-5 text-sm leading-relaxed whitespace-pre-wrap font-mono text-foreground/90" data-testid="analysis-text">
                                    {analysis}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="study-card">
                        <p className="eyebrow">Moves</p>
                        <p className="mt-3 font-mono text-sm leading-relaxed break-words" data-testid="move-list">
                            {chess.history().map((m, i) => i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ${m}` : ` ${m} `).join("")}
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
