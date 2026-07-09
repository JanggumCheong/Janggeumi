from .llm import generate_ingredient_guide


async def chat(message: str) -> str:
    return await generate_ingredient_guide(message)
