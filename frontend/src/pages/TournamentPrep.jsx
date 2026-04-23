import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Swords, BookOpen, Flame, Heart } from "lucide-react";

export default function TournamentPrep() {
    const drills = [
        { title: "Sharp 3-minute tactics burst", desc: "Five puzzles, one minute each. No hints.", to: "/tactics", icon: Target },
        { title: "Confidence endgame drill", desc: "Three K+P endings — win them all.", to: "/tactics?motif=endgame", icon: Swords },
        { title: "Openings refresher", desc: "Quickly review your top lines before the round.", to: "/lessons", icon: BookOpen },
        { title: "Ask your coach", desc: "A 90-second pre-round pep talk.", to: "/coach", icon: Heart },
    ];
    return (
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
            <p className="eyebrow">Tournament Prep</p>
            <h1 className="font-serif text-4xl md:text-6xl mt-2">Before the round.</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl">
                Sharp, short, confidence-building. Don&rsquo;t over-study the hour before playing. Warm up, breathe, trust the preparation.
            </p>

            <div className="mt-10 grid md:grid-cols-2 gap-5">
                {drills.map((d) => {
                    const Icon = d.icon;
                    return (
                        <Link key={d.title} to={d.to} data-testid={`prep-${d.title}`} className="study-card hover:border-accent transition-colors">
                            <Icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
                            <h3 className="font-serif text-2xl mt-4">{d.title}</h3>
                            <p className="text-sm text-muted-foreground mt-3">{d.desc}</p>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-12 study-card">
                <p className="eyebrow">Time management</p>
                <ul className="mt-4 text-sm space-y-2 list-disc list-inside">
                    <li>Budget roughly 1.5 minutes per move in standard games.</li>
                    <li>Never check the clock mid-calculation — finish the thought, then check.</li>
                    <li>If the position is simple, play quickly. Save time for complex moments.</li>
                </ul>
                <p className="eyebrow mt-8">Emotional readiness</p>
                <ul className="mt-4 text-sm space-y-2 list-disc list-inside">
                    <li>Eat. Hydrate. Ten minutes away from screens before the round.</li>
                    <li>One blunder does not define the game. Learn and continue.</li>
                    <li>Respect the opponent. Enjoy the game. The rest follows.</li>
                </ul>
            </div>
        </div>
    );
}
