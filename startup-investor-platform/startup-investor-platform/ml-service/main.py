from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

from ml_engine import MLEngine

app = FastAPI(title="Startup-Investor AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML engine at startup
ml_engine = MLEngine()

# ─── Pydantic Models ────────────────────────────────────────────────────────

class StartupAnalysisRequest(BaseModel):
    description: str
    sector: str
    funding: float
    teamSize: int
    experience: Optional[float] = 3.0
    marketSize: Optional[float] = 1000000.0
    stage: Optional[str] = "seed"

class PitchAnalysisRequest(BaseModel):
    transcript: Optional[str] = ""
    videoUrl: Optional[str] = ""

class SimilarityRequest(BaseModel):
    embedding1: List[float]
    embedding2: List[float]

class EmbedRequest(BaseModel):
    text: str

class BatchMatchRequest(BaseModel):
    startup_embedding: List[float]
    investor_sectors: List[str]
    startup_sector: str
    funding_required: float
    investor_min: float
    investor_max: float
    preferred_stages: List[str]
    startup_stage: str
    risk_level: str

# ─── Routes ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": ml_engine.models_loaded}

@app.post("/analyze-startup")
async def analyze_startup(req: StartupAnalysisRequest):
    """Full startup analysis: success score + NLP embedding + competition detection"""
    try:
        result = ml_engine.analyze_startup(
            description=req.description,
            sector=req.sector,
            funding=req.funding,
            team_size=req.teamSize,
            experience=req.experience,
            market_size=req.marketSize,
            stage=req.stage
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-success")
async def predict_success(req: StartupAnalysisRequest):
    """Predict startup success probability using Random Forest"""
    try:
        score = ml_engine.predict_success(
            funding=req.funding,
            team_size=req.teamSize,
            experience=req.experience,
            market_size=req.marketSize,
            stage=req.stage,
            sector=req.sector
        )
        return {"success_score": score, "grade": ml_engine.score_to_grade(score)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed")
async def embed_text(req: EmbedRequest):
    """Get text embedding using TF-IDF"""
    try:
        embedding = ml_engine.get_embedding(req.text)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/similarity")
async def compute_similarity(req: SimilarityRequest):
    """Compute cosine similarity between two embeddings"""
    try:
        sim = ml_engine.cosine_similarity(
            np.array(req.embedding1),
            np.array(req.embedding2)
        )
        return {"similarity": float(sim)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/find-competitors")
async def find_competitors(req: StartupAnalysisRequest):
    """Find similar startups using NLP + cosine similarity"""
    try:
        result = ml_engine.find_competitors(req.description, req.sector)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-pitch")
async def analyze_pitch(req: PitchAnalysisRequest):
    """Analyze pitch transcript for quality metrics"""
    try:
        result = ml_engine.analyze_pitch(req.transcript or "")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sector-insights/{sector}")
async def sector_insights(sector: str):
    """Get ML-based insights for a sector"""
    try:
        return ml_engine.get_sector_insights(sector)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

