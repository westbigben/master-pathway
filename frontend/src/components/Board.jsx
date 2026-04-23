import { Chessboard } from "react-chessboard";
import { useTheme } from "@/context/ThemeContext";

/**
 * Wrapper around react-chessboard v5 using the `options` prop API.
 * onDrop(source, target) returns true/false to accept the move.
 */
export default function Board({
    position,
    onDrop,
    orientation = "white",
    allowDrag = true,
    highlightSquares = {}, // { e4: { background: "rgba(...)" } }
}) {
    const { theme } = useTheme();

    const lightSq = theme === "dark" ? "#C6B38E" : "#EADDCA";
    const darkSq  = theme === "dark" ? "#2E3A30" : "#4A5D4E";

    return (
        <div className="board-wrap w-full" data-testid="chess-board-wrap">
            <Chessboard
                options={{
                    position,
                    boardOrientation: orientation,
                    allowDragging: allowDrag,
                    showAnimations: true,
                    animationDurationInMs: 150,
                    showNotation: true,
                    boardStyle: {
                        borderRadius: 2,
                        boxShadow: "0 10px 30px -15px rgba(0,0,0,0.25)",
                        width: "100%",
                    },
                    lightSquareStyle: { backgroundColor: lightSq },
                    darkSquareStyle: { backgroundColor: darkSq },
                    squareStyles: highlightSquares,
                    onPieceDrop: ({ sourceSquare, targetSquare }) => {
                        if (!targetSquare || !allowDrag) return false;
                        return onDrop ? onDrop(sourceSquare, targetSquare) : false;
                    },
                }}
            />
        </div>
    );
}
