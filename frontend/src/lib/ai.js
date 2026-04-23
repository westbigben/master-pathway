// Lightweight minimax chess AI using chess.js
// Depth depends on difficulty (1..5). Eval uses material + mobility + center.
import { Chess } from "chess.js";

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Piece-square tables (very small, just enough to add positional flavour)
const PAWN_PST = [
    [0,0,0,0,0,0,0,0],
    [50,50,50,50,50,50,50,50],
    [10,10,20,30,30,20,10,10],
    [5,5,10,25,25,10,5,5],
    [0,0,0,20,20,0,0,0],
    [5,-5,-10,0,0,-10,-5,5],
    [5,10,10,-20,-20,10,10,5],
    [0,0,0,0,0,0,0,0],
];
const KNIGHT_PST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,0,0,0,0,-20,-40],
    [-30,0,10,15,15,10,0,-30],
    [-30,5,15,20,20,15,5,-30],
    [-30,0,15,20,20,15,0,-30],
    [-30,5,10,15,15,10,5,-30],
    [-40,-20,0,5,5,0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50],
];

function pstValue(piece, fileIdx, rankIdx) {
    const r = piece.color === "w" ? 7 - rankIdx : rankIdx;
    if (piece.type === "p") return PAWN_PST[r][fileIdx];
    if (piece.type === "n") return KNIGHT_PST[r][fileIdx];
    return 0;
}

function evaluate(chess) {
    if (chess.isCheckmate()) return chess.turn() === "w" ? -99999 : 99999;
    if (chess.isDraw() || chess.isStalemate()) return 0;
    const board = chess.board();
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
            const piece = board[r][f];
            if (!piece) continue;
            const val = PIECE_VALUES[piece.type] + pstValue(piece, f, r);
            score += piece.color === "w" ? val : -val;
        }
    }
    return score;
}

function minimax(chess, depth, alpha, beta, maximizing) {
    if (depth === 0 || chess.isGameOver()) return evaluate(chess);
    const moves = chess.moves();
    if (maximizing) {
        let best = -Infinity;
        for (const m of moves) {
            chess.move(m);
            const score = minimax(chess, depth - 1, alpha, beta, false);
            chess.undo();
            best = Math.max(best, score);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        return best;
    } else {
        let best = Infinity;
        for (const m of moves) {
            chess.move(m);
            const score = minimax(chess, depth - 1, alpha, beta, true);
            chess.undo();
            best = Math.min(best, score);
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
        }
        return best;
    }
}

// difficulty 1..5 → depth + randomness
export function pickAiMove(fen, difficulty = 2) {
    const chess = new Chess(fen);
    const moves = chess.moves();
    if (moves.length === 0) return null;

    // Level 1: random — very beginner
    if (difficulty <= 1) {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    const depthMap = { 2: 1, 3: 2, 4: 3, 5: 3 };
    const depth = depthMap[difficulty] || 2;
    const maximizing = chess.turn() === "w";

    // Score every move
    const scored = moves.map((m) => {
        chess.move(m);
        const score = minimax(chess, depth - 1, -Infinity, Infinity, !maximizing);
        chess.undo();
        return { move: m, score };
    });
    scored.sort((a, b) => (maximizing ? b.score - a.score : a.score - b.score));

    // Add noise on low difficulties: pick randomly from top-k
    const k = { 2: 4, 3: 3, 4: 2, 5: 1 }[difficulty] || 3;
    const pool = scored.slice(0, Math.min(k, scored.length));
    return pool[Math.floor(Math.random() * pool.length)].move;
}
