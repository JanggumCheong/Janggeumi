import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. 현재 파일(database.py)이 위치한 곳을 기준으로 backend 폴더 루트 경로를 잡습니다.
# app/database.py 의 부모(app)의 부모 -> backend/
BASE_DIR = Path(__file__).resolve().parent.parent

ENV_LOCAL_PATH = BASE_DIR / ".env.local"
ENV_PATH = BASE_DIR / ".env"

# 2. 확실하게 계산된 절대 경로(Absolute Path)로 dotenv를 로드합니다.
if ENV_LOCAL_PATH.exists():
    load_dotenv(dotenv_path=ENV_LOCAL_PATH, override=True)
else:
    load_dotenv(dotenv_path=ENV_PATH, override=True)


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        f"SUPABASE_URL and SUPABASE_KEY/SUPABASE_ANON_KEY must be set in environment variables.\n"
        f"Attempted to load from: {ENV_LOCAL_PATH} or {ENV_PATH}"
    )

# 싱글톤 클라이언트 생성
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# FastAPI 엔드포인트에서 주입받아 사용할 함수
def get_db() -> Client:
    """Return a singleton Supabase client for backend routes."""
    return supabase_client