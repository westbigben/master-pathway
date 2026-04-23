"""Authentication: JWT + bcrypt email/password auth."""
import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel, EmailStr, Field

JWT_ALGORITHM = "HS256"
ACCESS_MINUTES = 60 * 24 * 7  # one-week access token for MVP simplicity


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


# ---------- Schemas ----------
class RegisterPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)
    role: str = Field(default="student")  # "student" | "parent"


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    created_at: str
    rating: int = 800
    streak: int = 0
    last_active: Optional[str] = None
    stage: int = 1
    title: str = "Apprentice"
    xp: int = 0
    linked_student_id: Optional[str] = None  # for parents


def _public_user(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "email": doc["email"],
        "name": doc["name"],
        "role": doc["role"],
        "created_at": doc["created_at"],
        "rating": doc.get("rating", 800),
        "streak": doc.get("streak", 0),
        "last_active": doc.get("last_active"),
        "stage": doc.get("stage", 1),
        "title": doc.get("title", "Apprentice"),
        "xp": doc.get("xp", 0),
        "linked_student_id": doc.get("linked_student_id"),
    }


# ---------- Dependency ----------
async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = request.app.state.db
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------- Router ----------
router = APIRouter(prefix="/auth", tags=["auth"])


def _set_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_MINUTES * 60,
        path="/",
    )


@router.post("/register", response_model=UserPublic)
async def register(payload: RegisterPayload, request: Request, response: Response):
    db = request.app.state.db
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    role = payload.role if payload.role in ("student", "parent") else "student"
    doc = {
        "id": user_id,
        "email": email,
        "name": payload.name.strip(),
        "password_hash": hash_password(payload.password),
        "role": role,
        "created_at": now_iso,
        "rating": 800,
        "streak": 0,
        "last_active": None,
        "stage": 1,
        "title": "Apprentice",
        "xp": 0,
        "linked_student_id": None,
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email)
    _set_cookie(response, token)
    return _public_user(doc)


@router.post("/login", response_model=UserPublic)
async def login(payload: LoginPayload, request: Request, response: Response):
    db = request.app.state.db
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    _set_cookie(response, token)
    return _public_user(user)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@router.get("/me", response_model=UserPublic)
async def me(user=Depends(get_current_user)):
    return _public_user(user)


class LinkStudentPayload(BaseModel):
    student_email: EmailStr


@router.post("/link-student", response_model=UserPublic)
async def link_student(payload: LinkStudentPayload, request: Request, user=Depends(get_current_user)):
    if user["role"] != "parent":
        raise HTTPException(status_code=403, detail="Only parents can link a student")
    db = request.app.state.db
    student = await db.users.find_one({"email": payload.student_email.lower().strip(), "role": "student"}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="No student account with that email")
    await db.users.update_one({"id": user["id"]}, {"$set": {"linked_student_id": student["id"]}})
    user["linked_student_id"] = student["id"]
    return _public_user(user)
