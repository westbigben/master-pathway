"""Parent dashboard routes."""
from collections import Counter
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request

from auth import get_current_user


router = APIRouter(prefix="/parent", tags=["parent"])


@router.get("/dashboard")
async def dashboard(request: Request, user=Depends(get_current_user)):
    if user["role"] != "parent":
        raise HTTPException(403, detail="Only parents can view this dashboard")
    if not user.get("linked_student_id"):
        raise HTTPException(400, detail="Link a student first")

    db = request.app.state.db
    student = await db.users.find_one({"id": user["linked_student_id"]}, {"_id": 0, "password_hash": 0})
    if not student:
        raise HTTPException(404, detail="Linked student not found")

    # Last 14 days of training
    since = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()
    sessions = await db.training_log.find({"user_id": student["id"], "ts": {"$gte": since}}, {"_id": 0}).to_list(200)
    total_minutes = sum(s.get("minutes", 0) for s in sessions)

    attempts = await db.puzzle_attempts.find({"user_id": student["id"], "ts": {"$gte": since}}, {"_id": 0}).to_list(500)
    solved = sum(1 for a in attempts if a.get("solved"))
    accuracy = round(100 * solved / max(len(attempts), 1), 1)

    # Common mistake motifs (failed attempts)
    mistakes = Counter(a["motif"] for a in attempts if not a.get("solved"))
    top_mistakes = mistakes.most_common(3)

    lessons_done = await db.lesson_completions.count_documents({"user_id": student["id"]})
    games_played = await db.games.count_documents({"user_id": student["id"]})

    # Encouragement note (simple deterministic)
    if solved > 20:
        note = f"{student['name']} has been relentless this week — {solved} puzzles solved. Acknowledge the consistency."
    elif student.get("streak", 0) >= 3:
        note = f"{student['name']} is on a {student['streak']}-day streak. Consistency is the engine of improvement."
    elif accuracy > 75 and attempts:
        note = f"Accuracy at {accuracy}% — precision is forming. Gentle push on volume will compound."
    else:
        note = "Short daily sessions beat long rare ones. Help protect the 30-minute slot."

    return {
        "student": {
            "id": student["id"],
            "name": student["name"],
            "email": student["email"],
            "rating": student.get("rating", 800),
            "title": student.get("title", "Apprentice"),
            "stage": student.get("stage", 1),
            "streak": student.get("streak", 0),
            "xp": student.get("xp", 0),
        },
        "training_minutes_14d": total_minutes,
        "sessions_14d": len(sessions),
        "puzzle_attempts_14d": len(attempts),
        "puzzles_solved_14d": solved,
        "tactical_accuracy": accuracy,
        "common_mistake_motifs": [{"motif": m, "count": c} for m, c in top_mistakes],
        "lessons_completed": lessons_done,
        "games_played": games_played,
        "encouragement_note": note,
        "daily_minutes_series": _daily_minutes_series(sessions),
    }


def _daily_minutes_series(sessions: list) -> list:
    by_day = {}
    for s in sessions:
        d = s.get("date", s["ts"][:10])
        by_day[d] = by_day.get(d, 0) + s.get("minutes", 0)
    today = datetime.now(timezone.utc).date()
    series = []
    for i in range(13, -1, -1):
        d = (today - timedelta(days=i)).isoformat()
        series.append({"date": d, "minutes": by_day.get(d, 0)})
    return series
