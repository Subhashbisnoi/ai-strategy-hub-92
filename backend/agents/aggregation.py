"""Aggregation Agent — parses bank statement data, classifies transactions via GPT-4o mini."""

from __future__ import annotations

import json
from openai import OpenAI
from sqlalchemy.orm import Session
from models import Transaction


SYSTEM_PROMPT = """You are a financial data aggregation agent for small businesses.
Given raw bank-statement transaction lines, return a JSON array where each element is:
{
  "date": "YYYY-MM-DD",
  "description": "<cleaned description>",
  "amount": <positive number>,
  "type": "credit" or "debit",
  "category": one of ["Revenue", "Expense", "COGS", "Tax", "Salary", "Rent", "Marketing", "Utilities", "Other"],
  "merchant": "<merchant/vendor name if identifiable, else empty string>"
}
Return ONLY the JSON array, nothing else."""


def classify_transactions(raw_text: str, client: OpenAI) -> list[dict]:
    """Send raw text to GPT-4o mini for classification."""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": raw_text},
        ],
        temperature=0.1,
        max_tokens=4096,
    )
    content = resp.choices[0].message.content.strip()
    # strip markdown fences if present
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        content = content.rsplit("```", 1)[0]
    return json.loads(content)


def process_and_store(raw_text: str, client: OpenAI, db: Session, session_id: str) -> list[dict]:
    """Classify transactions and persist to DB. Returns the classified list."""
    classified = classify_transactions(raw_text, client)
    rows = []
    for t in classified:
        row = Transaction(
            session_id=session_id,
            date=t["date"],
            description=t["description"],
            amount=t["amount"],
            type=t["type"],
            category=t["category"],
            merchant=t.get("merchant", ""),
        )
        db.add(row)
        rows.append(t)
    db.commit()
    return rows
