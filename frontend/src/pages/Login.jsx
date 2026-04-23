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

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setErr(""); setLoading(true);
        try {
            const u = await login(form.email, form.password);
            nav(u.role === "parent" ? "/parent" : "/dashboard");
        } catch (e) {
            setErr(formatError(e.response?.data?.detail) || e.message);
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-between p-12 bg-secondary/40 border-r border-border relative overflow-hidden">
                <div className="grain absolute inset-0" />
                <Link to="/" className="relative flex items-center gap-2" data-testid="login-brand">
                    <Crown className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    <span className="font-serif text-xl">Chess Master <span className="italic text-accent">Journey</span></span>
                </Link>
                <div className="relative">
                    <p className="eyebrow">Return to Studio</p>
                    <blockquote className="font-serif text-3xl md:text-4xl mt-4 leading-tight max-w-md">
                        &ldquo;One blunder does not define the game. Learn and continue.&rdquo;
                    </blockquote>
                    <p className="eyebrow mt-4">— your coach</p>
                </div>
                <span className="relative eyebrow">Plate 02 · Re-entry</span>
            </div>
            <div className="flex items-center justify-center p-8 md:p-16">
                <form onSubmit={submit} className="w-full max-w-sm space-y-6" data-testid="login-form">
                    <div>
                        <p className="eyebrow">Login</p>
                        <h1 className="font-serif text-4xl mt-2">Welcome back.</h1>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-mono uppercase text-xs tracking-widest" htmlFor="email">Email</Label>
                        <Input id="email" data-testid="login-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="rounded-sm h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-mono uppercase text-xs tracking-widest" htmlFor="password">Password</Label>
                        <Input id="password" data-testid="login-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="rounded-sm h-11" />
                    </div>
                    {err && <p className="text-sm text-destructive" data-testid="login-error">{err}</p>}
                    <Button type="submit" disabled={loading} className="w-full h-11 rounded-sm font-mono uppercase text-xs tracking-widest" data-testid="login-submit">
                        {loading ? "Entering..." : "Enter the Studio"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        New here? <Link to="/register" className="text-accent underline-offset-4 hover:underline" data-testid="login-to-register">Begin the journey</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
