import re, numpy as np

def clean_text(text: str) -> str:
    if not text: return ""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', ' ', text)
    return re.sub(r'\s+', ' ', text)

def normalize_funding(amount: float) -> float:
    return min(amount / 10_000_000, 1.0)

def score_to_color(score: float) -> str:
    return "green" if score >= 80 else "yellow" if score >= 60 else "red"

def format_currency(amount: float) -> str:
    if amount >= 1_000_000: return f"${amount/1_000_000:.1f}M"
    elif amount >= 1_000: return f"${amount/1_000:.0f}K"
    return f"${amount:.0f}"
