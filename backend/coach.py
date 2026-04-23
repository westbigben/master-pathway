"""Coach: Claude Sonnet 4.5 integration for chat, game analysis, encouragement."""
import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from auth import get_current_user
from emergentintegrations.llm.chat import LlmChat, UserMessage


router = APIRouter(prefix="/coach", tags=["coach"])


COACH_SYSTEM = (
    "You are the Chess Master Journey coach — a disciplined, inspiring, calm mentor for a "
    "motivated 13-year-old chess student working toward tournament strength. "
    "You speak with the quiet confidence of a real chess trainer. "
    "Never patronise. Never use childish tone. Keep language simple but never dumb. "
    "Celebrate effort and improvement. Point out one concrete lesson per mistake. "
    "Keep replies under 140 words unless analysing a specific game. "
    "When asked about a position, think in candidate moves (checks, captures, threats)."
)


def _key() -> str:
    return os.environ["EMERGENT_LLM_KEY"]


async def _claude(session_id: str, system: str, user_text: str) -> str:
    chat = LlmChat(api_key=_key(), session_id=session_id, system_message=system).with_model(
        "anthropic", "claude-sonnet-4-5-20250929"
    )
    return await chat.send_message(UserMessage(text=user_text))


# ---------- Coach chat ----------
class CoachChatPayload(BaseModel):
    message: str = Field(min_length=1)
    session_id: str | None = None


@router.post("/chat")
async def coach_chat(payload: CoachChatPayload, request: Request, user=Depends(get_current_user)):
    session_id = payload.session_id or f"coach-{user['id']}"
    db = request.app.state.db

    context = (
        f"Student name: {user['name']}. Current rating {user.get('rating', 800)}. "
        f"Title {user.get('title', 'Apprentice')}. Stage {user.get('stage', 1)}. "
        f"Streak {user.get('streak', 0)} days."
    )
    try:
        reply = await _claude(session_id, COACH_SYSTEM + " " + context, payload.message)
    except Exception as e:
        raise HTTPException(502, detail=f"Coach unavailable: {e}")

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.coach_messages.insert_many(
        [
            {"session_id": session_id, "user_id": user["id"], "role": "user", "text": payload.message, "ts": now_iso},
            {"session_id": session_id, "user_id": user["id"], "role": "assistant", "text": reply, "ts": now_iso},
        ]
    )
    return {"reply": reply, "session_id": session_id}


@router.get("/history")
async def coach_history(request: Request, user=Depends(get_current_user), session_id: str | None = None):
    db = request.app.state.db
    q = {"user_id": user["id"]}
    if session_id:
        q["session_id"] = session_id
    msgs = await db.coach_messages.find(q, {"_id": 0}).sort("ts", 1).to_list(200)
    return msgs


# ---------- Game analysis ----------
class GameAnalyzePayload(BaseModel):
    pgn: str
    result: str  # "win" | "loss" | "draw"
    player_color: str  # "white" | "black"
    ai_level: int | None = None


@router.post("/analyze-game")
async def analyze_game(payload: GameAnalyzePayload, request: Request, user=Depends(get_current_user)):
    db = request.app.state.db
    game_id = str(uuid.uuid4())
    prompt = (
        f"Analyse this game played by {user['name']} (rating ~{user.get('rating', 800)}). "
        f"They played as {payload.player_color} and the result was {payload.result}. "
        "Return exactly these sections, concise and specific:\n"
        "1) BLUNDERS: list up to 3 moves where the student went clearly wrong (move number + piece + why).\n"
        "2) MISSED TACTICS: up to 2 tactical opportunities missed.\n"
        "3) OPENING FEEDBACK: 1-2 sentences.\n"
        "4) ENDGAME FEEDBACK: 1-2 sentences (say 'N/A' if the game did not reach an endgame).\n"
        "5) BEST MOVE SUGGESTION: one pivotal position + the move you'd recommend and why.\n"
        "6) KEY LESSON: one single sentence takeaway to internalise.\n\n"
        f"PGN:\n{payload.pgn}"
    )
    try:
        reply = await _claude(f"analyze-{game_id}", COACH_SYSTEM, prompt)
    except Exception as e:
        raise HTTPException(502, detail=f"Analysis unavailable: {e}")

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.games.insert_one(
        {
            "id": game_id,
            "user_id": user["id"],
            "pgn": payload.pgn,
            "result": payload.result,
            "player_color": payload.player_color,
            "ai_level": payload.ai_level,
            "analysis": reply,
            "ts": now_iso,
        }
    )
    return {"game_id": game_id, "analysis": reply}


@router.get("/games")
async def list_games(request: Request, user=Depends(get_current_user)):
    db = request.app.state.db
    games = await db.games.find({"user_id": user["id"]}, {"_id": 0, "pgn": 0}).sort("ts", -1).to_list(50)
    return games
