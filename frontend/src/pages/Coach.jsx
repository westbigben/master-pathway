import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

const SUGGESTIONS = [
    "What should I focus on this week?",
    "Explain forks vs. pins in one minute.",
    "How do I stop hanging pieces?",
    "Give me a 5-minute warm-up before a tournament round.",
];

export default function Coach() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        api.get("/coach/history").then(({ data }) => setMessages(data)).catch(() => {});
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const send = async (text) => {
        const msg = text ?? input;
        if (!msg.trim()) return;
        setInput("");
        setSending(true);
        const now = new Date().toISOString();
        setMessages((m) => [...m, { role: "user", text: msg, ts: now }]);
        try {
            const { data } = await api.post("/coach/chat", { message: msg });
            setMessages((m) => [...m, { role: "assistant", text: data.reply, ts: new Date().toISOString() }]);
        } catch (e) {
            setMessages((m) => [...m, { role: "assistant", text: "Coach is unavailable right now. Try again in a moment.", ts: new Date().toISOString() }]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
            <p className="eyebrow">Your Coach</p>
            <h1 className="font-serif text-4xl md:text-5xl mt-2">
                Ask <span className="italic text-accent">anything</span> about the board.
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">Short, specific, honest answers. Your coach knows your current rating, streak, and stage.</p>

            <div ref={scrollRef} className="mt-8 study-card min-h-[340px] max-h-[60vh] overflow-y-auto space-y-4" data-testid="coach-transcript">
                {messages.length === 0 && (
                    <p className="text-sm text-muted-foreground">No messages yet. Try one of the prompts below to begin.</p>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={m.role === "user" ? "text-right" : ""}>
                        <p className={`inline-block max-w-[85%] text-sm leading-relaxed p-3 rounded-sm ${m.role === "user" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`} data-testid={`msg-${m.role}`}>
                            {m.text}
                        </p>
                    </div>
                ))}
                {sending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Coach is thinking...</div>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => send(s)} data-testid={`coach-suggest-${i}`} className="font-mono uppercase text-xs tracking-widest px-3 py-2 border border-border rounded-sm hover:bg-secondary">
                        {s}
                    </button>
                ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-6 flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Ask your coach, ${user?.name?.split(" ")[0] || ""}…`} className="rounded-sm h-11" data-testid="coach-input" />
                <Button type="submit" disabled={sending || !input.trim()} className="rounded-sm font-mono uppercase text-xs tracking-widest h-11 px-5" data-testid="coach-send">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
