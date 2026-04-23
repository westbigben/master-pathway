"""Backend API tests for Chess Master Journey.

Covers: auth, roadmap, puzzles, lessons, daily plan, coach (Claude), parent dashboard.
Uses BASE_URL from REACT_APP_BACKEND_URL (public preview ingress).
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://master-pathway.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

STUDENT_EMAIL = "student@chessjourney.app"
PARENT_EMAIL = "parent@chessjourney.app"
PASSWORD = "journey123"


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def student_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Student login failed: {r.status_code} {r.text}"
    assert s.cookies.get("access_token"), "access_token cookie not set"
    return s


@pytest.fixture(scope="module")
def parent_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": PARENT_EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Parent login failed: {r.status_code} {r.text}"
    return s


# ---------- Health ----------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------- Auth module ----------
class TestAuth:
    def test_register_new_student(self):
        s = requests.Session()
        email = f"test_user_{uuid.uuid4().hex[:8]}@chessjourney.app"
        r = s.post(f"{API}/auth/register", json={
            "email": email, "password": "testpass123", "name": "Test Kid", "role": "student"
        }, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email
        assert data["role"] == "student"
        assert data["rating"] == 800
        assert data["title"] == "Apprentice"
        assert s.cookies.get("access_token"), "register should set access_token cookie"

        # /me returns same user with cookie
        me = s.get(f"{API}/auth/me", timeout=15)
        assert me.status_code == 200
        assert me.json()["email"] == email

    def test_register_duplicate_rejected(self):
        r = requests.post(f"{API}/auth/register", json={
            "email": STUDENT_EMAIL, "password": PASSWORD, "name": "Dup", "role": "student"
        }, timeout=15)
        assert r.status_code == 400

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": "wrongpass"}, timeout=15)
        assert r.status_code == 401

    def test_me_requires_auth(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_login_student_and_me(self, student_session):
        r = student_session.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == STUDENT_EMAIL

    def test_logout_clears_cookie(self):
        s = requests.Session()
        s.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": PASSWORD}, timeout=15)
        assert s.cookies.get("access_token")
        r = s.post(f"{API}/auth/logout", timeout=15)
        assert r.status_code == 200
        # After logout the /me should 401
        me = s.get(f"{API}/auth/me", timeout=15)
        # Note: server deletes cookie via Set-Cookie; requests session will drop it
        assert me.status_code == 401

    def test_link_student_parent_only(self, student_session):
        r = student_session.post(f"{API}/auth/link-student", json={"student_email": STUDENT_EMAIL}, timeout=15)
        assert r.status_code == 403

    def test_link_student_by_parent(self, parent_session):
        r = parent_session.post(f"{API}/auth/link-student", json={"student_email": STUDENT_EMAIL}, timeout=15)
        assert r.status_code == 200
        assert r.json()["linked_student_id"] is not None


# ---------- Content ----------
class TestContent:
    def test_roadmap(self):
        r = requests.get(f"{API}/roadmap", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) == 4
        for stage in data:
            assert "milestones" in stage
            assert "target_rating" in stage

    def test_puzzles_list(self):
        r = requests.get(f"{API}/puzzles", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) > 0

    def test_puzzle_motifs(self):
        r = requests.get(f"{API}/puzzles/motifs", timeout=15)
        assert r.status_code == 200
        motifs = r.json()
        assert isinstance(motifs, list) and len(motifs) >= 1
        keys = [m["key"] for m in motifs]
        assert "fork" in keys

    def test_puzzle_filter_fork(self):
        r = requests.get(f"{API}/puzzles?motif=fork", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(p["motif"] == "fork" for p in data)

    def test_puzzle_by_id(self):
        all_p = requests.get(f"{API}/puzzles", timeout=15).json()
        pid = all_p[0]["id"]
        r = requests.get(f"{API}/puzzles/{pid}", timeout=15)
        assert r.status_code == 200
        assert r.json()["id"] == pid

    def test_lessons_list(self):
        r = requests.get(f"{API}/lessons", timeout=15)
        assert r.status_code == 200
        lessons = r.json()
        assert isinstance(lessons, list) and len(lessons) == 10

    def test_lesson_by_id(self):
        lessons = requests.get(f"{API}/lessons", timeout=15).json()
        lid = lessons[0]["id"]
        r = requests.get(f"{API}/lessons/{lid}", timeout=15)
        assert r.status_code == 200
        assert r.json()["id"] == lid


# ---------- Training ----------
class TestTraining:
    def test_puzzle_attempt_solved_increases_rating(self, student_session):
        before = student_session.get(f"{API}/auth/me", timeout=15).json()
        puzzles = requests.get(f"{API}/puzzles", timeout=15).json()
        pid = puzzles[0]["id"]
        r = student_session.post(f"{API}/puzzles/attempt", json={
            "puzzle_id": pid, "solved": True, "attempts": 1, "time_seconds": 5.0, "used_hint": False
        }, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["rating_delta"] > 0
        after = student_session.get(f"{API}/auth/me", timeout=15).json()
        assert after["rating"] == before["rating"] + data["rating_delta"]

    def test_puzzle_attempt_failed_decreases_rating(self, student_session):
        before = student_session.get(f"{API}/auth/me", timeout=15).json()
        puzzles = requests.get(f"{API}/puzzles", timeout=15).json()
        pid = puzzles[0]["id"]
        r = student_session.post(f"{API}/puzzles/attempt", json={
            "puzzle_id": pid, "solved": False, "attempts": 2, "time_seconds": 15.0, "used_hint": False
        }, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["rating_delta"] < 0
        after = student_session.get(f"{API}/auth/me", timeout=15).json()
        assert after["rating"] == max(200, before["rating"] + data["rating_delta"])

    def test_lesson_complete_awards_xp(self, student_session):
        before = student_session.get(f"{API}/auth/me", timeout=15).json()
        lessons = requests.get(f"{API}/lessons", timeout=15).json()
        r = student_session.post(f"{API}/lessons/complete", json={"lesson_id": lessons[0]["id"]}, timeout=15)
        assert r.status_code == 200
        assert r.json()["xp_gain"] == 25
        after = student_session.get(f"{API}/auth/me", timeout=15).json()
        assert after["xp"] >= before["xp"] + 25

    def test_daily_plan_structure(self, student_session):
        r = student_session.get(f"{API}/daily/plan", timeout=15)
        assert r.status_code == 200
        plan = r.json()
        assert "date" in plan
        assert "blocks" in plan
        types = {b["type"] for b in plan["blocks"]}
        for t in ("tactics", "endgame", "lesson", "play", "reflect"):
            assert t in types, f"Missing block type {t}"
        tac = next(b for b in plan["blocks"] if b["type"] == "tactics")
        assert "puzzles" in tac and len(tac["puzzles"]) > 0
        lesson_block = next(b for b in plan["blocks"] if b["type"] == "lesson")
        assert "lesson" in lesson_block

    def test_daily_complete_updates_streak(self, student_session):
        r = student_session.post(f"{API}/daily/complete", json={"minutes_spent": 30}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["streak"] >= 1


# ---------- Coach (Claude) ----------
class TestCoach:
    def test_coach_chat(self, student_session):
        r = student_session.post(f"{API}/coach/chat",
                                 json={"message": "Give me one quick tactical tip in under 30 words."},
                                 timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "reply" in data and len(data["reply"]) > 10
        assert "session_id" in data

    def test_coach_history(self, student_session):
        r = student_session.get(f"{API}/coach/history", timeout=30)
        assert r.status_code == 200
        msgs = r.json()
        assert isinstance(msgs, list) and len(msgs) >= 2

    def test_analyze_game(self, student_session):
        pgn = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 1-0"
        r = student_session.post(f"{API}/coach/analyze-game", json={
            "pgn": pgn, "result": "win", "player_color": "white", "ai_level": 3
        }, timeout=120)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "game_id" in data
        assert "analysis" in data and len(data["analysis"]) > 50


# ---------- Parent dashboard ----------
class TestParent:
    def test_parent_dashboard(self, parent_session):
        # Ensure linked
        parent_session.post(f"{API}/auth/link-student", json={"student_email": STUDENT_EMAIL}, timeout=15)
        r = parent_session.get(f"{API}/parent/dashboard", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "student" in data
        assert data["student"]["email"] == STUDENT_EMAIL
        assert "daily_minutes_series" in data and len(data["daily_minutes_series"]) == 14
        assert "common_mistake_motifs" in data
        assert "encouragement_note" in data and len(data["encouragement_note"]) > 0

    def test_parent_dashboard_forbidden_for_student(self, student_session):
        r = student_session.get(f"{API}/parent/dashboard", timeout=15)
        assert r.status_code == 403
