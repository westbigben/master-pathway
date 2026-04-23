"""Content routes: roadmap, puzzles, lessons, daily plan."""
import random
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from auth import get_current_user
from seed import ROADMAP, PUZZLES, LESSONS, daily_plan_for, title_for_rating


router = APIRouter(tags=["content"])


# ---------- Roadmap ----------
@router.get("/roadmap")
async def get_roadmap():
    return ROADMAP


# ---------- Puzzles ----------
@router.get("/puzzles")
async def list_puzzles(motif: str | None = None, difficulty: int | None = None, limit: int = 20):
    pool = PUZZLES
    if motif and motif != "all":
        pool = [p for p in pool if p["motif"] == motif]
    if difficulty:
        pool = [p for p in pool if p["difficulty"] == difficulty]
    return pool[:limit]


@router.get("/puzzles/motifs")
async def puzzle_motifs():
    motifs = sorted({p["motif"] for p in PUZZLES})
    return [{"key": m, "count": sum(1 for p in PUZZLES if p["motif"] == m)} for m in motifs]


@router.get("/puzzles/{puzzle_id}")
async def get_puzzle(puzzle_id: str):
    for p in PUZZLES:
        if p["id"] == puzzle_id:
            return p
    raise HTTPException(404, detail="Puzzle not found")


class AttemptPayload(BaseModel):
    puzzle_id: str
    solved: bool
    attempts: int = 1
    time_seconds: float = 0.0
    used_hint: bool = False


@router.post("/puzzles/attempt")
async def record_attempt(payload: AttemptPayload, request: Request, user=Depends(get_current_user)):
    db = request.app.state.db
    puzzle = next((p for p in PUZZLES if p["id"] == payload.puzzle_id), None)
    if not puzzle:
        raise HTTPException(404, detail="Puzzle not found")

    # Rating delta: +5..+20 for solved (harder = more), -3..-10 for failed
    base = puzzle["difficulty"] * 4
    if payload.solved:
        delta = base + (3 if not payload.used_hint else 0)
        if payload.attempts > 1:
            delta = max(1, delta // 2)
    else:
        delta = -min(10, base // 2)

    new_rating = max(200, user.get("rating", 800) + delta)
    new_title = title_for_rating(new_rating)
    xp_gain = 10 if payload.solved else 2

    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "rating": new_rating,
                "title": new_title["name"],
                "stage": max(user.get("stage", 1), new_title["stage"]),
            },
            "$inc": {"xp": xp_gain},
        },
    )

    # Log the attempt for parent/analytics
    from datetime import datetime, timezone
    await db.puzzle_attempts.insert_one(
        {
            "user_id": user["id"],
            "puzzle_id": payload.puzzle_id,
            "motif": puzzle["motif"],
            "difficulty": puzzle["difficulty"],
            "solved": payload.solved,
            "attempts": payload.attempts,
            "time_seconds": payload.time_seconds,
            "used_hint": payload.used_hint,
            "rating_delta": delta,
            "ts": datetime.now(timezone.utc).isoformat(),
        }
    )

    return {
        "rating": new_rating,
        "rating_delta": delta,
        "title": new_title["name"],
        "xp_gain": xp_gain,
        "stage": max(user.get("stage", 1), new_title["stage"]),
    }


# ---------- Lessons ----------
@router.get("/lessons")
async def list_lessons(stage: int | None = None):
    if stage:
        return [l for l in LESSONS if l["stage"] == stage]
    return LESSONS


@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    for l in LESSONS:
        if l["id"] == lesson_id:
            return l
    raise HTTPException(404, detail="Lesson not found")


class LessonCompletePayload(BaseModel):
    lesson_id: str


@router.post("/lessons/complete")
async def complete_lesson(payload: LessonCompletePayload, request: Request, user=Depends(get_current_user)):
    db = request.app.state.db
    lesson = next((l for l in LESSONS if l["id"] == payload.lesson_id), None)
    if not lesson:
        raise HTTPException(404, detail="Lesson not found")

    from datetime import datetime, timezone
    await db.lesson_completions.update_one(
        {"user_id": user["id"], "lesson_id": payload.lesson_id},
        {"$set": {"user_id": user["id"], "lesson_id": payload.lesson_id, "ts": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    await db.users.update_one({"id": user["id"]}, {"$inc": {"xp": 25}})
    return {"ok": True, "xp_gain": 25}


# ---------- Daily plan ----------
@router.get("/daily/plan")
async def get_daily_plan(user=Depends(get_current_user)):
    plan = daily_plan_for(user)

    # Choose concrete puzzles for the tactics block
    tactics_block = next(b for b in plan["blocks"] if b["type"] == "tactics")
    motifs = tactics_block["motifs"]
    pool = [p for p in PUZZLES if p["motif"] in motifs]
    random.seed(plan["date"] + user["id"])
    tactics_block["puzzles"] = random.sample(pool, min(tactics_block["count"], len(pool)))

    endgame_block = next(b for b in plan["blocks"] if b["type"] == "endgame")
    endgame_pool = [p for p in PUZZLES if p["motif"] == "endgame"]
    endgame_block["puzzles"] = random.sample(endgame_pool, min(endgame_block["count"], len(endgame_pool)))

    # Pick a lesson
    lesson_block = next(b for b in plan["blocks"] if b["type"] == "lesson")
    candidate_lessons = [l for l in LESSONS if l["stage"] <= user.get("stage", 1)]
    lesson_block["lesson"] = random.choice(candidate_lessons)

    return plan


class DailyCompletePayload(BaseModel):
    minutes_spent: int = 30


@router.post("/daily/complete")
async def complete_daily(payload: DailyCompletePayload, request: Request, user=Depends(get_current_user)):
    from datetime import datetime, timezone, date
    db = request.app.state.db
    today = date.today().isoformat()
    last = user.get("last_active")
    streak = user.get("streak", 0)
    if last == today:
        pass  # already counted today
    elif last:
        from datetime import datetime as _dt
        last_d = last[:10]
        from datetime import date as _date, timedelta
        yesterday = (_date.today() - timedelta(days=1)).isoformat()
        streak = streak + 1 if last_d == yesterday else 1
    else:
        streak = 1

    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_active": today, "streak": streak}, "$inc": {"xp": 40}},
    )
    await db.training_log.insert_one(
        {
            "user_id": user["id"],
            "date": today,
            "minutes": payload.minutes_spent,
            "ts": datetime.now(timezone.utc).isoformat(),
        }
    )
    return {"streak": streak, "xp_gain": 40}


# ---------- Titles ----------
@router.get("/titles")
async def get_titles():
    from seed import TITLES
    return TITLES
