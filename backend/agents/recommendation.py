"""Recommendation Agent — uses GPT-4o mini to generate actionable business recommendations."""

from __future__ import annotations

import json
from openai import OpenAI
from sqlalchemy.orm import Session
from models import Recommendation


SYSTEM_PROMPT = """You are an AI business advisor for small businesses in India.
Given the business data summary below, generate exactly 4 actionable recommendations.
Each recommendation must be one of these types: "growth", "cost", or "product".

Return a JSON array where each element is:
{
  "type": "growth" | "cost" | "product",
  "title": "<short actionable title>",
  "description": "<2-3 sentence explanation with specific numbers/reasoning>",
  "impact": "<quantified expected impact, e.g. 'Projected +₹1.5L/month revenue'>",
  "confidence": <integer 60-98>
}
Return ONLY the JSON array, nothing else."""


def generate_recommendations(
    financial_summary: dict,
    inventory_data: list[dict],
    client: OpenAI,
    db: Session,
    session_id: str,
) -> list[dict]:
    """Generate AI recommendations based on current business data."""
    user_content = f"""Business Financial Summary:
- Total Revenue: ₹{financial_summary.get('total_revenue', 0):,.0f}
- Total Expenses: ₹{financial_summary.get('total_expenses', 0):,.0f}
- Net Profit: ₹{financial_summary.get('net_profit', 0):,.0f}
- Profit Margin: {financial_summary.get('profit_margin', 0)}%
- Transaction Count: {financial_summary.get('transaction_count', 0)}

Category Breakdown: {json.dumps(financial_summary.get('category_breakdown', []))}

Inventory Data:
{json.dumps(inventory_data, indent=2)}
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.7,
        max_tokens=2048,
    )
    content = resp.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        content = content.rsplit("```", 1)[0]
    recs = json.loads(content)

    # Delete only this session's old recommendations, then insert new ones
    db.query(Recommendation).filter(Recommendation.session_id == session_id).delete()
    for r in recs:
        db.add(Recommendation(
            session_id=session_id,
            type=r["type"],
            title=r["title"],
            description=r["description"],
            impact=r["impact"],
            confidence=r["confidence"],
        ))
    db.commit()
    return recs


def get_cached_recommendations(db: Session, session_id: str) -> list[dict]:
    rows = (
        db.query(Recommendation)
        .filter(Recommendation.session_id == session_id)
        .order_by(Recommendation.confidence.desc())
        .all()
    )
    return [
        {
            "type": r.type,
            "title": r.title,
            "description": r.description,
            "impact": r.impact,
            "confidence": r.confidence,
        }
        for r in rows
    ]
