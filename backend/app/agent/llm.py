import os

from openai import AsyncOpenAI


INGREDIENT_GUIDE_SYSTEM_PROMPT = """
You are Janggeumi, a Korean ingredient guide for everyday home cooks.

Your job is to answer the user's utterance about food ingredients without
querying a database. Infer the ingredient and the user's intent from the
utterance, then provide practical guidance.

Intent categories:
- purchase: buying tips, freshness checks, signs to avoid, season/market tips
- storage: room-temperature, refrigerated, frozen, cut/uncut, moisture and odor control
- handling: washing, trimming, peeling, cutting, pre-cooking, leftover use, disposal

Rules:
- Answer in Korean.
- Do not mention SQL, databases, tables, rows, or internal implementation.
- If the ingredient is unclear, ask one short clarification and give a brief example of what you can help with.
- If the intent is unclear but an ingredient is clear, cover purchase, storage, and handling briefly.
- Prefer common, safe household guidance. If you are unsure, say so and give a conservative recommendation.
- For mold, rotten smell, sliminess, swollen packaging, raw meat/seafood risk, or food poisoning concerns, err on discarding and advise not tasting to check.
- Do not make medical, nutrition-cure, or guaranteed safety claims.
- Keep the answer concise and scannable. Use only the sections that fit the user's question.
""".strip()


def _get_client() -> AsyncOpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    return AsyncOpenAI(api_key=api_key)


def _get_model() -> str:
    return os.getenv("OPENAI_INGREDIENT_GUIDE_MODEL") or os.getenv("OPENAI_MODEL") or "gpt-4.1-mini"


async def generate_ingredient_guide(message: str) -> str:
    """Generate ingredient purchase, storage, and handling guidance."""
    response = await _get_client().responses.create(
        model=_get_model(),
        input=[
            {
                "role": "system",
                "content": INGREDIENT_GUIDE_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": message,
            },
        ],
    )

    answer = response.output_text.strip()
    if not answer:
        raise RuntimeError("Ingredient guide response was empty.")

    return answer
