from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging

from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from auth import router as auth_router
from content import router as content_router
from coach import router as coach_router
from parent import router as parent_router


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Chess Master Journey API")

# MongoDB
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]
app.state.db = db

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Chess Master Journey API", "ok": True}


api_router.include_router(auth_router)
api_router.include_router(content_router)
api_router.include_router(coach_router)
api_router.include_router(parent_router)

app.include_router(api_router)

# CORS — credentials require explicit origins. In dev we still allow * because the
# cookie is set samesite=lax + secure=false (same-origin via ingress).
cors_origins = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.puzzle_attempts.create_index("user_id")
    await db.training_log.create_index([("user_id", 1), ("date", 1)])
    logger.info("Chess Master Journey API ready")


@app.on_event("shutdown")
async def shutdown():
    client.close()
