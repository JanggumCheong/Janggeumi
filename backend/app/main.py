from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Janggeumi API",
    version="0.1.0",
    description="Backend API for the Janggeumi project.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Janggeumi FastAPI backend is running", "status": "ok"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
