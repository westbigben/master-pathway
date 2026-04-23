import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown } from "lucide-react";

function formatError(detail) {
    if (!detail) return "Something went wrong.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
    return String(detail);
}

export default function Register() {
    const { register } = useAuth();
    const nav = useNavigate();
    const [form, setForm] = useState({ email: "", password: "", name: "", role: "student" });
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setErr(""); setLoading(true);
        try {
            const u = await register(form.email, form.password, form.name, form.role);
            nav(u.role === "parent" ? "/parent" : "/dashboard");
        } catch (e) {
            setErr(formatError(e.response?.data?.detail) || e.message);
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-between p-12 bg-secondary/40 border-r border-border relative overflow-hidden">
                <div className="grain absolute inset-0" />
                <Link to="/" className="relative flex items-center gap-2" data-testid="register-brand">
                    <Crown className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    <span className="font-serif text-xl">Chess Master <span className="italic text-accent">Journey</span></span>
                </Link>
                <div className="relative">
                    <p className="eyebrow">A personal studio</p>
                    <h2 className="font-serif text-4xl mt-4 leading-tight max-w-md">
                        Every grandmaster was once a thirteen-year-old with a chessboard and a question.
                    </h2>
                </div>
                <span className="relative eyebrow">Plate 03 · Enrollment</span>
            </div>
            <div className="flex items-center justify-center p-8 md:p-16">
                <form onSubmit={submit} className="w-full max-w-sm space-y-5" data-testid="register-form">
                    <div>
                        <p className="eyebrow">Begin</p>
                        <h1 className="font-serif text-4xl mt-2">Open your studio.</h1>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {["student", "parent"].map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setForm({ ...form, role: r })}
                                data-testid={`register-role-${r}`}
                                className={`rounded-sm border px-4 py-3 font-mono uppercase text-xs tracking-widest ${
                                    form.role === r ? "border-accent bg-accent text-accent-foreground" : "border-border hover:bg-secondary"
                                }`}
                            >
                                {r === "student" ? "Student" : "Parent"}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label className="font-mono uppercase text-xs tracking-widest" htmlFor="name">Name</Label>
                        <Input id="name" data-testid="register-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-sm h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-mono uppercase text-xs tracking-widest" htmlFor="email">Email</Label>
                        <Input id="email" data-testid="register-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="rounded-sm h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-mono uppercase text-xs tracking-widest" htmlFor="password">Password</Label>
                        <Input id="password" data-testid="register-password" type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="rounded-sm h-11" />
                    </div>
                    {err && <p className="text-sm text-destructive" data-testid="register-error">{err}</p>}
                    <Button type="submit" disabled={loading} className="w-full h-11 rounded-sm font-mono uppercase text-xs tracking-widest" data-testid="register-submit">
                        {loading ? "Opening..." : "Open Studio"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Already enrolled? <Link to="/login" className="text-accent underline-offset-4 hover:underline" data-testid="register-to-login">Return here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
