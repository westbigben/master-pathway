"""Seed content: roadmap, curated puzzles, lessons, titles."""
from datetime import datetime, timezone

# Titles / ranks (per motivation system)
TITLES = [
    {"name": "Apprentice", "min_rating": 0, "stage": 1},
    {"name": "Club Player", "min_rating": 1000, "stage": 2},
    {"name": "Competitor", "min_rating": 1300, "stage": 2},
    {"name": "Expert", "min_rating": 1600, "stage": 3},
    {"name": "Candidate Master", "min_rating": 1900, "stage": 4},
    {"name": "Master Path", "min_rating": 2200, "stage": 4},
]


def title_for_rating(rating: int) -> dict:
    chosen = TITLES[0]
    for t in TITLES:
        if rating >= t["min_rating"]:
            chosen = t
    return chosen


ROADMAP = [
    {
        "stage": 1,
        "name": "Foundations",
        "blurb": "Board vision, piece activity, basic checkmates, first tactics, opening principles.",
        "milestones": [
            "Complete 5 board-vision lessons",
            "Solve 30 basic tactics puzzles",
            "Deliver 10 back-rank mates",
            "Finish Opening Principles lesson",
        ],
        "target_rating": 1000,
    },
    {
        "stage": 2,
        "name": "Intermediate",
        "blurb": "Pins, forks, skewers, discovered attacks, candidate moves, calculation, pawn structures, basic endgames.",
        "milestones": [
            "Master all tactical motifs",
            "Win a K+P vs K endgame",
            "Reach 1300 rating",
            "Annotate one complete game",
        ],
        "target_rating": 1300,
    },
    {
        "stage": 3,
        "name": "Competitive",
        "blurb": "Positional play, planning, time management, opening repertoire, advanced endgames, tournament mindset.",
        "milestones": [
            "Build a White and Black opening repertoire",
            "Win 5 rook endgames vs the engine",
            "Reach 1600 rating",
            "Complete Positional Play module",
        ],
        "target_rating": 1600,
    },
    {
        "stage": 4,
        "name": "Master Track",
        "blurb": "Deep calculation, strategic themes, game annotation, opponent prep, psychological resilience.",
        "milestones": [
            "Calculate 5-move variations accurately",
            "Study 10 classical master games",
            "Reach 1900 rating",
            "Complete Tournament Prep module",
        ],
        "target_rating": 2000,
    },
]


# 40 curated puzzles. Each: fen (position before solution), solution (list of UCI moves),
# motif, difficulty (1..5), title, explanation. Mover is always side to move in FEN.
PUZZLES = [
    # ---- Back-rank mates (motif: back_rank) ----
    {"id": "p001", "fen": "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1", "solution": ["a1a8"], "motif": "back_rank", "difficulty": 1, "title": "Back-rank finish", "explanation": "With the Black king trapped behind its own pawns, Ra8# ends the game instantly."},
    {"id": "p002", "fen": "6k1/5p1p/6p1/8/8/8/5PPP/4R1K1 w - - 0 1", "solution": ["e1e8"], "motif": "back_rank", "difficulty": 1, "title": "The corridor", "explanation": "Re8# — the f7-g6-h7 pawns form a cage; the rook closes the corridor."},
    {"id": "p003", "fen": "1r4k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", "solution": ["d1d8"], "motif": "back_rank", "difficulty": 2, "title": "Trade and mate", "explanation": "Rd8+ forces Rxd8 Rxd8# — the back rank is undefended after the trade."},

    # ---- Mate in 1 ----
    {"id": "p004", "fen": "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2", "solution": ["d8h4"], "motif": "mate_in_1", "difficulty": 1, "title": "Fool's Mate", "explanation": "Qh4# — White's weakened kingside lets the queen strike on h4."},
    {"id": "p005", "fen": "6k1/6pp/8/8/8/8/5PPP/4R1K1 w - - 0 1", "solution": ["e1e8"], "motif": "mate_in_1", "difficulty": 1, "title": "Immediate", "explanation": "Re8#. The most common pattern in chess — always scan for it."},

    # ---- Mate in 2 ----
    {"id": "p006", "fen": "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4", "solution": ["g7f6"], "motif": "mate_in_2", "difficulty": 2, "title": "Scholar's trap", "explanation": "Defensive gxf6 is forced — but White had already won with Qxf7#. Study the scholar's mate pattern."},
    {"id": "p007", "fen": "r3k2r/ppp2ppp/2n5/2b5/2B5/2N5/PP3PPP/R3K2R w KQkq - 0 1", "solution": ["c4f7", "e8e7", "f7b3"], "motif": "mate_in_2", "difficulty": 3, "title": "Bishop probe", "explanation": "Bxf7+ pulls the king out; after Ke7, quiet Bb3 is strong — aim bishop at future targets."},

    # ---- Forks ----
    {"id": "p008", "fen": "r3k2r/pppq1ppp/2n5/3np3/8/2N5/PPPQ1PPP/R3K2R w KQkq - 0 1", "solution": ["c3d5"], "motif": "fork", "difficulty": 2, "title": "Knight fork", "explanation": "Nxd5 wins the knight and forks queen + rook ideas after exchanges."},
    {"id": "p009", "fen": "4r1k1/5ppp/8/3N4/8/8/5PPP/6K1 w - - 0 1", "solution": ["d5f6", "g7f6", "e8e1"], "motif": "fork", "difficulty": 3, "title": "Discovered fork setup", "explanation": "Nf6+ forces gxf6, then you have a winning endgame up a knight."},
    {"id": "p010", "fen": "r3k2r/ppp2ppp/8/3q4/3N4/8/PPP2PPP/R2Q1RK1 w kq - 0 1", "solution": ["d4c6"], "motif": "fork", "difficulty": 2, "title": "Royal fork", "explanation": "Nxc6 forks queen and rook — classic knight geometry."},
    {"id": "p011", "fen": "8/8/8/3k4/8/4N3/8/4K3 w - - 0 1", "solution": ["e3f5"], "motif": "fork", "difficulty": 1, "title": "Knight geometry", "explanation": "Nf5 controls key squares — train your eye to see knight reach."},
    {"id": "p012", "fen": "r4rk1/ppp2ppp/8/8/1nB5/8/PPP2PPP/R4RK1 b - - 0 1", "solution": ["b4c2"], "motif": "fork", "difficulty": 2, "title": "The c2 fork", "explanation": "Nxc2 forks rook + bishop and wins material."},

    # ---- Pins ----
    {"id": "p013", "fen": "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1", "solution": ["c1g5"], "motif": "pin", "difficulty": 2, "title": "Pin the defender", "explanation": "Bg5 pins the f6-knight to the queen — the attacker on f6 can no longer defend."},
    {"id": "p014", "fen": "r1bqkbnr/ppp2ppp/2n5/3pp3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1", "solution": ["f1b5"], "motif": "pin", "difficulty": 2, "title": "Ruy pin", "explanation": "Bb5 pins the c6-knight against the king (Ruy Lopez idea)."},
    {"id": "p015", "fen": "r2qkb1r/ppp2ppp/2n1bn2/3pp3/8/2NP1N2/PPP1PPPP/R1BQKB1R w KQkq - 0 1", "solution": ["c1g5"], "motif": "pin", "difficulty": 2, "title": "Pin on f6", "explanation": "Bg5 pins the knight and prepares trading on f6 to shatter Black's kingside."},

    # ---- Skewers ----
    {"id": "p016", "fen": "8/8/4k3/8/8/3K4/8/R6q w - - 0 1", "solution": ["a1a6", "e6d7", "a6h6"], "motif": "skewer", "difficulty": 3, "title": "Rook skewer", "explanation": "Ra6+ skewers king and queen along the 6th rank."},
    {"id": "p017", "fen": "8/8/8/3k4/8/8/1K6/q6R w - - 0 1", "solution": ["h1d1"], "motif": "skewer", "difficulty": 2, "title": "Long-range skewer", "explanation": "Rd1+ wins the queen via the d-file skewer."},

    # ---- Discovered attack ----
    {"id": "p018", "fen": "r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPPQPPP/R1B1K2R w KQkq - 0 1", "solution": ["c3d5"], "motif": "discovered_attack", "difficulty": 3, "title": "Uncover the threat", "explanation": "Nd5 both attacks the bishop on b4 and opens the queen's diagonal."},
    {"id": "p019", "fen": "r2qkb1r/ppp2ppp/2n2n2/3p4/3P4/2N2N2/PP2PPPP/R1BQ1RK1 w kq - 0 1", "solution": ["c3b5"], "motif": "discovered_attack", "difficulty": 3, "title": "Jump with purpose", "explanation": "Nb5 uncovers the d-file pressure and attacks c7 — two threats at once."},

    # ---- Deflection ----
    {"id": "p020", "fen": "6k1/5ppp/8/8/8/1q6/5PPP/2R3K1 w - - 0 1", "solution": ["c1c8"], "motif": "deflection", "difficulty": 3, "title": "Deflect the defender", "explanation": "Rc8+! forces Kxc8 only if defended — in fact, Black loses the queen to the back-rank threat."},
    {"id": "p021", "fen": "r4rk1/pp3ppp/8/8/2q5/8/PP3PPP/R2Q1RK1 w - - 0 1", "solution": ["d1d8"], "motif": "deflection", "difficulty": 3, "title": "Trade to win", "explanation": "Rxd8 deflects the rook off the 8th rank, winning the queen."},

    # ---- Clearance ----
    {"id": "p022", "fen": "r3r1k1/pp3ppp/2p5/8/2Q5/2N5/PP3PPP/4R1K1 w - - 0 1", "solution": ["c3e4"], "motif": "clearance", "difficulty": 4, "title": "Clear the line", "explanation": "Ne4 clears c3 while threatening a devastating jump to f6 or d6."},

    # ---- Sacrifice ----
    {"id": "p023", "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", "solution": ["c4f7"], "motif": "sacrifice", "difficulty": 3, "title": "Bishop sac", "explanation": "Bxf7+! pulls the king into a storm; follow with Ng5+ for strong attack."},
    {"id": "p024", "fen": "r2q1rk1/ppp2ppp/2n5/3np1N1/2B5/8/PPP2PPP/R2Q1RK1 w - - 0 1", "solution": ["g5f7"], "motif": "sacrifice", "difficulty": 4, "title": "Knight storm", "explanation": "Nxf7! destroys Black's king cover — accept or lose the exchange."},

    # ---- Mate in 3 ----
    {"id": "p025", "fen": "6k1/5ppp/8/8/8/8/5PPP/R3R1K1 w - - 0 1", "solution": ["a1a8", "g8h7", "e1e7"], "motif": "mate_in_3", "difficulty": 3, "title": "Two rooks attack", "explanation": "Ra8+ forces Kh7, then Re7 threatens mate on h8."},

    # ---- Endgame basics mixed as puzzles ----
    {"id": "p026", "fen": "8/8/8/3k4/3P4/3K4/8/8 w - - 0 1", "solution": ["d3c3"], "motif": "endgame", "difficulty": 2, "title": "Opposition", "explanation": "Kc3! gains the opposition — your king must shoulder the enemy king aside to promote."},
    {"id": "p027", "fen": "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1", "solution": ["e5e6"], "motif": "endgame", "difficulty": 2, "title": "Pawn advance with opposition", "explanation": "e6! — when your king is in front of your pawn two squares ahead, the pawn queens."},
    {"id": "p028", "fen": "8/8/8/8/8/3k4/3p4/3K4 b - - 0 1", "solution": ["d3e3"], "motif": "endgame", "difficulty": 2, "title": "King and pawn vs king", "explanation": "Ke3 — keep your king escorting the pawn forward."},
    {"id": "p029", "fen": "8/4k3/8/4K3/4R3/8/8/8 w - - 0 1", "solution": ["e4e1"], "motif": "endgame", "difficulty": 2, "title": "Rook lift", "explanation": "Re1 — mate is coming via the side squeeze."},

    # ---- More tactics ----
    {"id": "p030", "fen": "r3kb1r/pp1qpppp/2n2n2/2pp4/8/2NP1NP1/PPP1PPBP/R1BQ1RK1 w kq - 0 1", "solution": ["c3d5"], "motif": "fork", "difficulty": 3, "title": "Central leap", "explanation": "Nxd5! forks knight on f6 and queen on d7; material is won."},
    {"id": "p031", "fen": "r1bqr1k1/pp1n1ppp/2p2n2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 1", "solution": ["d3h7"], "motif": "sacrifice", "difficulty": 4, "title": "Greek gift", "explanation": "Bxh7+! classical bishop sacrifice — after Kxh7 Ng5+ Kg8 Qh5 the attack is decisive."},
    {"id": "p032", "fen": "6k1/pp3ppp/2p5/3r4/8/PP3QP1/5P1P/4R1K1 w - - 0 1", "solution": ["f3f8"], "motif": "mate_in_1", "difficulty": 1, "title": "Queen ending", "explanation": "Qf8#! — the rook on e1 covers the escape."},
    {"id": "p033", "fen": "r4rk1/1b3ppp/pp1qpn2/3p4/3P4/P1NBPN2/1P3PPP/R2Q1RK1 w - - 0 1", "solution": ["c3b5"], "motif": "fork", "difficulty": 3, "title": "b5 outpost", "explanation": "Nb5! attacks the queen and the c7 square — strong outpost."},
    {"id": "p034", "fen": "r1bqkb1r/pppp1ppp/2n2n2/8/2BpP3/5N2/PPP2PPP/RNBQK2R w KQkq - 0 1", "solution": ["f3g5"], "motif": "fork", "difficulty": 2, "title": "Kingside probe", "explanation": "Ng5 threatens f7 and drags the defender."},
    {"id": "p035", "fen": "r1bqk2r/pppp1ppp/5n2/2b1p1N1/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 1", "solution": ["g5f7"], "motif": "sacrifice", "difficulty": 3, "title": "Fried liver", "explanation": "Nxf7! the Fried Liver — sacrifice to pull the king out."},
    {"id": "p036", "fen": "8/8/4k3/4p3/4K3/8/8/8 w - - 0 1", "solution": ["e4d4"], "motif": "endgame", "difficulty": 2, "title": "Don't block", "explanation": "Kd4 — stay flexible; take the key square to gain opposition later."},
    {"id": "p037", "fen": "6k1/pp3ppp/2p5/8/2P5/5PP1/PP3K1P/8 w - - 0 1", "solution": ["c4c5"], "motif": "endgame", "difficulty": 3, "title": "Create a passer", "explanation": "c5! — advance the majority to create a passed pawn."},
    {"id": "p038", "fen": "r3k2r/pppq1ppp/2n5/3p4/3Pn3/2NQ1N2/PPP2PPP/R4RK1 b kq - 0 1", "solution": ["e4c3"], "motif": "fork", "difficulty": 2, "title": "Trade into an advantage", "explanation": "Nxc3 wrecks White's pawn structure and wins time."},
    {"id": "p039", "fen": "r1b2rk1/pp2qppp/2p5/8/3P4/5Q2/PP3PPP/R1B1R1K1 w - - 0 1", "solution": ["f3f7"], "motif": "sacrifice", "difficulty": 4, "title": "Queen smash", "explanation": "Qxf7+! Kxf7 Re7+ wins the queen — calculate the forcing sequence."},
    {"id": "p040", "fen": "6k1/1pp2ppp/p7/8/8/1P4P1/P1P2P1P/4R1K1 w - - 0 1", "solution": ["e1e8"], "motif": "back_rank", "difficulty": 1, "title": "Re-check the 8th", "explanation": "Re8#. Always verify the back rank in every position."},
]


LESSONS = [
    {
        "id": "l001",
        "title": "Why the Center Matters",
        "stage": 1,
        "minutes": 8,
        "summary": "Pieces placed in the center control more squares. A knight on e4 touches 8 squares; on a1 it touches just 2.",
        "key_points": [
            "Occupy or influence e4, d4, e5, d5",
            "Develop knights before bishops (they know where to go)",
            "Don't move the same piece twice in the opening without a reason",
        ],
        "demo_fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    },
    {
        "id": "l002",
        "title": "King Safety: Castle Early",
        "stage": 1,
        "minutes": 6,
        "summary": "An exposed king is a liability. Castling moves the king to safety and activates a rook in one move.",
        "key_points": [
            "Castle within the first 10 moves when possible",
            "Keep the castled pawns (f2, g2, h2) intact",
            "Be wary of Bxh7+ ideas if pieces aim at your king",
        ],
        "demo_fen": "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    },
    {
        "id": "l003",
        "title": "The Fork Family",
        "stage": 1,
        "minutes": 10,
        "summary": "A fork is a single move attacking two or more pieces at once. Knights fork with the unique L-shape.",
        "key_points": [
            "Always scan knight jumps first — they are hardest to see",
            "Queens fork along any line",
            "Pawns fork too — don't overlook them",
        ],
        "demo_fen": "r3k2r/pppq1ppp/2n5/3np3/8/2N5/PPPQ1PPP/R3K2R w KQkq - 0 1",
    },
    {
        "id": "l004",
        "title": "Pins and How to Break Them",
        "stage": 2,
        "minutes": 10,
        "summary": "A pin freezes a piece because moving it exposes something more valuable behind.",
        "key_points": [
            "An absolute pin (against the king) is illegal to break",
            "A relative pin costs material if ignored",
            "Break pins by interposing, capturing the pinner, or moving the pinned target",
        ],
        "demo_fen": "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1",
    },
    {
        "id": "l005",
        "title": "Candidate Moves",
        "stage": 2,
        "minutes": 12,
        "summary": "Strong players identify 2-4 candidate moves every move and compare them. Never play the first move you see.",
        "key_points": [
            "Ask: checks, captures, threats first",
            "Compare at least 2 candidates before committing",
            "Check opponent's best reply before moving",
        ],
        "demo_fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1",
    },
    {
        "id": "l006",
        "title": "Opposition in King and Pawn Endgames",
        "stage": 2,
        "minutes": 10,
        "summary": "Two kings facing each other with one square between them is the opposition — whoever must move loses ground.",
        "key_points": [
            "Take the opposition to push the enemy king aside",
            "Your king must escort the pawn to promotion",
            "Key squares: learn them for rook pawns vs center pawns",
        ],
        "demo_fen": "8/8/8/3k4/3P4/3K4/8/8 w - - 0 1",
    },
    {
        "id": "l007",
        "title": "Rook Endgames: Build the Bridge",
        "stage": 3,
        "minutes": 14,
        "summary": "The Lucena position is won by building a bridge with the rook to shelter the king from checks.",
        "key_points": [
            "Rook belongs behind passed pawns",
            "Cut off the enemy king along a file or rank",
            "Practice Lucena and Philidor until automatic",
        ],
        "demo_fen": "1K6/1P6/8/8/8/8/r7/3k3R w - - 0 1",
    },
    {
        "id": "l008",
        "title": "Weak Squares and Outposts",
        "stage": 3,
        "minutes": 11,
        "summary": "A square your opponent cannot defend with a pawn is weak. A knight planted there is an outpost — sometimes worth more than a rook.",
        "key_points": [
            "Create outposts via pawn breaks",
            "Trade bishops that defend key squares",
            "Always check both sides for weak squares",
        ],
        "demo_fen": "r2q1rk1/pp1nbppp/2p1bn2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 1",
    },
    {
        "id": "l009",
        "title": "How to Calculate",
        "stage": 3,
        "minutes": 14,
        "summary": "Calculation is a disciplined tree: candidates → replies → evaluate. Keep the board clear in your mind.",
        "key_points": [
            "Force moves first (checks, captures, threats)",
            "Visualize one move at a time — don't rush",
            "Verify the end position before choosing",
        ],
        "demo_fen": "r1b2rk1/pp2qppp/2p5/8/3P4/5Q2/PP3PPP/R1B1R1K1 w - - 0 1",
    },
    {
        "id": "l010",
        "title": "Tournament Mindset",
        "stage": 4,
        "minutes": 10,
        "summary": "One blunder does not define the game. Reset, breathe, play the position in front of you.",
        "key_points": [
            "Treat every move as a new decision — not a continuation of mistakes",
            "Manage time: use ~1.5 minutes per move baseline",
            "Eat and sleep before rounds — energy matters",
        ],
        "demo_fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4",
    },
]


def daily_plan_for(user: dict) -> dict:
    """Simple adaptive daily plan based on the user's rating/stage."""
    stage = user.get("stage", 1)
    rating = user.get("rating", 800)

    # Pedagogy priority: tactics > calculation > endgames > strategy > openings (later)
    if stage == 1:
        tactics_motifs = ["back_rank", "mate_in_1", "fork"]
    elif stage == 2:
        tactics_motifs = ["pin", "skewer", "fork", "discovered_attack"]
    elif stage == 3:
        tactics_motifs = ["deflection", "sacrifice", "clearance", "mate_in_3"]
    else:
        tactics_motifs = ["sacrifice", "clearance", "mate_in_3", "discovered_attack"]

    plan = {
        "date": datetime.now(timezone.utc).date().isoformat(),
        "total_minutes": 40,
        "blocks": [
            {"type": "tactics", "title": "Tactics sprint", "minutes": 10, "motifs": tactics_motifs, "count": 5},
            {"type": "endgame", "title": "Endgame drill", "minutes": 10, "motifs": ["endgame"], "count": 3},
            {"type": "lesson", "title": "Daily lesson", "minutes": 10, "stage_cap": stage},
            {"type": "play", "title": "Play & analyse", "minutes": 10, "ai_level": max(1, min(5, (rating - 600) // 300 + 1))},
            {"type": "reflect", "title": "Reflection", "minutes": 5},
        ],
        "note": "Pedagogy priority: tactics → calculation → endgames → strategy → openings later.",
    }
    return plan
