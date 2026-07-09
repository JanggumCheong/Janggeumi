from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..agent.ingredient_guide_agent import chat

router = APIRouter()
BUSY_MESSAGE = "장금이가 바빠요. 잠시후에 물어봐주세요"


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)


@router.post("/chat")
async def ai_chat(request: ChatRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="message must not be empty")

    try:
        answer = await chat(message)
    except Exception:
        answer = BUSY_MESSAGE

    return {"answer": answer}
