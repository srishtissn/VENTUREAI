"""
Core ML Engine — Real Scikit-learn models for startup intelligence.
Uses: TF-IDF + Cosine Similarity, Random Forest Classifier, NLP text analysis
"""

import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os

# ─── Synthetic Training Data ─────────────────────────────────────────────────
TRAINING_DATA = {
    "descriptions": [
        "AI-powered fintech platform for automated financial planning and investment management using machine learning",
        "Blockchain-based supply chain transparency solution for enterprise logistics and tracking",
        "Telemedicine platform connecting patients with doctors for remote healthcare consultation",
        "EdTech platform providing personalized learning using adaptive AI algorithms for K-12",
        "B2B SaaS for HR automation and employee performance management analytics",
        "E-commerce marketplace for sustainable and eco-friendly products with carbon tracking",
        "AgriTech IoT solution for smart farming with soil sensors and crop prediction AI",
        "Cybersecurity platform for real-time threat detection using behavioral analytics",
        "Mental health app with AI therapist chatbot and mood tracking for Gen Z",
        "PropTech platform for AI-driven real estate valuation and investment analysis",
        "Gaming startup building Web3 play-to-earn games with NFT-based assets",
        "CleanTech solution for carbon credit marketplace and ESG compliance tracking",
        "Legal tech platform automating contract review and legal document generation using NLP",
        "FoodTech startup delivering personalized nutrition plans with AI dietitian",
        "SpaceTech company building small satellite constellation for IoT connectivity",
        "Social commerce app for Gen Z creators to monetize content and sell products",
        "HealthTech wearable for continuous glucose monitoring with predictive alerts",
        "MarketingTech AI for automated content creation and social media management",
        "BioTech company developing CRISPR-based gene therapy for rare diseases",
        "HRTech platform using AI for unbiased hiring and diversity analytics",
    ],
    "sectors": ["fintech","blockchain","healthtech","edtech","saas","ecommerce","agritech","cybersecurity","healthtech","proptech","gaming","cleantech","legaltech","foodtech","spacetech","social","healthtech","marketingtech","biotech","hrtech"],
    "features": [
        # [funding, team_size, experience, market_size_M, stage_num, sector_num]
        [500000, 8, 7, 500, 2, 1],   # fintech - success
        [750000, 6, 5, 200, 2, 2],   # blockchain - moderate
        [1000000, 12, 10, 800, 3, 3], # healthtech - success
        [300000, 4, 3, 150, 1, 4],   # edtech - moderate
        [450000, 7, 6, 300, 2, 5],   # saas - success
        [200000, 3, 2, 100, 1, 6],   # ecommerce - low
        [600000, 9, 8, 400, 2, 7],   # agritech - success
        [900000, 11, 9, 600, 3, 8],  # cybersecurity - success
        [150000, 2, 1, 80, 0, 3],    # healthtech - low
        [800000, 10, 8, 700, 3, 10], # proptech - success
        [1200000, 15, 6, 300, 3, 11], # gaming - moderate
        [700000, 8, 7, 900, 2, 12],  # cleantech - success
        [400000, 5, 4, 250, 2, 13],  # legaltech - moderate
        [250000, 3, 2, 120, 1, 14],  # foodtech - low
        [5000000, 20, 15, 1000, 4, 15], # spacetech - success
        [100000, 2, 1, 50, 0, 16],   # social - low
        [2000000, 18, 12, 800, 4, 3], # healthtech - success
        [350000, 5, 4, 200, 1, 18],  # marketingtech - moderate
        [10000000, 30, 20, 2000, 5, 19], # biotech - success
        [600000, 7, 6, 350, 2, 20],  # hrtech - success
    ],
    "labels": [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1]
}

STAGE_MAP = {"idea": 0, "pre-seed": 1, "seed": 2, "series-a": 3, "series-b": 4, "growth": 5, "ipo": 6}
SECTOR_MAP = {s: i+1 for i, s in enumerate(["fintech","healthtech","edtech","agritech","ecommerce","saas","ai-ml","blockchain","cleantech","logistics","proptech","gaming","social","cybersecurity","biotech","spacetech","foodtech","legaltech","hrtech","marketingtech","other"])}

FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "literally", "actually", "sort of", "kind of", "right", "okay so", "i mean", "just", "very", "really"]

class MLEngine:
    def __init__(self):
        self.models_loaded = False
        self.tfidf = TfidfVectorizer(max_features=500, stop_words='english', ngram_range=(1, 2))
        self.rf_classifier = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
        self.scaler = StandardScaler()
        self._train_models()

    def _train_models(self):
        """Train models on synthetic data"""
        try:
            # Train TF-IDF on startup descriptions
            self.tfidf.fit(TRAINING_DATA["descriptions"])

            # Train Random Forest for success prediction
            X = np.array(TRAINING_DATA["features"], dtype=float)
            y = np.array(TRAINING_DATA["labels"])
            # Add more synthetic samples for robustness
            X_aug, y_aug = self._augment_data(X, y, n=200)
            X_scaled = self.scaler.fit_transform(X_aug)
            self.rf_classifier.fit(X_scaled, y_aug)
            self.models_loaded = True
            print("✅ ML models trained successfully")
        except Exception as e:
            print(f"❌ Model training error: {e}")
            self.models_loaded = False

    def _augment_data(self, X, y, n=200):
        """Generate synthetic augmented training data"""
        np.random.seed(42)
        X_aug = list(X)
        y_aug = list(y)
        for _ in range(n):
            # High success features
            X_aug.append([
                np.random.uniform(200000, 2000000),  # funding
                np.random.randint(4, 25),             # team
                np.random.uniform(4, 15),             # experience
                np.random.uniform(100, 1000),         # market (M)
                np.random.randint(1, 5),              # stage
                np.random.randint(1, 21),             # sector
            ])
            y_aug.append(1 if np.random.random() > 0.35 else 0)
        return np.array(X_aug), np.array(y_aug)

    def get_embedding(self, text: str) -> np.ndarray:
        """Get TF-IDF embedding for text"""
        vec = self.tfidf.transform([text])
        return vec.toarray()[0]

    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Compute cosine similarity between two vectors"""
        if vec1.shape != vec2.shape:
            return 0.0
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(np.dot(vec1, vec2) / (norm1 * norm2))

    def predict_success(self, funding, team_size, experience, market_size, stage, sector) -> float:
        """Predict startup success probability using Random Forest"""
        stage_num = STAGE_MAP.get(stage, 1)
        sector_num = SECTOR_MAP.get(sector, 10)
        features = np.array([[
            float(funding),
            float(team_size),
            float(experience),
            float(market_size) / 1_000_000,  # normalize to millions
            stage_num,
            sector_num
        ]])
        features_scaled = self.scaler.transform(features)
        proba = self.rf_classifier.predict_proba(features_scaled)[0]
        # Get probability of success class
        success_prob = proba[1] if len(proba) > 1 else proba[0]
        # Add sector bonus
        hot_sectors = ["ai-ml", "healthtech", "fintech", "saas", "cybersecurity"]
        sector_bonus = 0.05 if sector in hot_sectors else 0
        score = min((success_prob + sector_bonus) * 100, 98)
        return round(score, 1)

    def score_to_grade(self, score: float) -> str:
        if score >= 85: return "A+"
        elif score >= 75: return "A"
        elif score >= 65: return "B+"
        elif score >= 55: return "B"
        elif score >= 45: return "C"
        else: return "D"

    def find_competitors(self, description: str, sector: str):
        """Find similar startups using TF-IDF cosine similarity"""
        query_vec = self.get_embedding(description)
        similarities = []
        for i, desc in enumerate(TRAINING_DATA["descriptions"]):
            doc_vec = self.get_embedding(desc)
            sim = self.cosine_similarity(query_vec, doc_vec)
            if sim > 0.1:
                similarities.append({
                    "index": i,
                    "description": desc[:100] + "...",
                    "sector": TRAINING_DATA["sectors"][i],
                    "similarity": round(sim * 100, 1)
                })
        # Filter by same/similar sector
        same_sector = [s for s in similarities if s["sector"] == sector]
        similar_count = len([s for s in similarities if s["similarity"] > 20])
        competition_level = "high" if similar_count >= 5 else "medium" if similar_count >= 3 else "low"
        return {
            "similar_count": similar_count,
            "competition_level": competition_level,
            "competitors": sorted(same_sector, key=lambda x: x["similarity"], reverse=True)[:5],
            "competitor_ids": []  # Would be DB IDs in production
        }

    def analyze_startup(self, description, sector, funding, team_size, experience, market_size, stage):
        """Full startup analysis combining all ML models"""
        success_score = self.predict_success(funding, team_size, experience, market_size, stage, sector)
        embedding = self.get_embedding(description)
        competition = self.find_competitors(description, sector)
        nlp_score = self._nlp_quality_score(description)
        # Blend NLP quality into success score
        final_score = round(success_score * 0.7 + nlp_score * 0.3, 1)
        return {
            "success_score": final_score,
            "grade": self.score_to_grade(final_score),
            "embedding": embedding.tolist(),
            "nlp_score": nlp_score,
            "similar_count": competition["similar_count"],
            "competition_level": competition["competition_level"],
            "competitors": competition["competitors"],
            "competitor_ids": competition["competitor_ids"],
            "breakdown": {
                "ml_score": success_score,
                "nlp_quality": nlp_score,
                "final": final_score
            }
        }

    def _nlp_quality_score(self, text: str) -> float:
        """Score text quality: length, keywords, clarity"""
        if not text: return 30.0
        words = text.split()
        score = 40.0
        # Length bonus
        if len(words) >= 50: score += 15
        elif len(words) >= 20: score += 8
        # Keyword presence
        strong_keywords = ["revenue","growth","market","solution","problem","customers","technology","platform","scale","traction","team","product","unique","data"]
        found = sum(1 for kw in strong_keywords if kw.lower() in text.lower())
        score += min(found * 3, 30)
        # Sentence structure
        sentences = text.split('.')
        if len(sentences) >= 3: score += 10
        return min(score, 95.0)

    def analyze_pitch(self, transcript: str):
        """Analyze pitch transcript quality"""
        if not transcript:
            return {"clarity": 50, "filler_words": 0, "sentiment": "neutral", "word_count": 0, "key_topics": [], "grade": "C"}
        words = transcript.lower().split()
        word_count = len(words)
        # Count filler words
        filler_count = sum(transcript.lower().count(fw) for fw in FILLER_WORDS)
        filler_rate = filler_count / max(word_count, 1) * 100
        # Clarity score
        clarity = max(10, 100 - int(filler_rate * 5))
        # Sentiment (simple keyword-based)
        positive = ["growth","opportunity","solution","innovative","leading","proven","success"]
        negative = ["problem","difficult","challenge","struggle","loss","risk"]
        pos_count = sum(transcript.lower().count(w) for w in positive)
        neg_count = sum(transcript.lower().count(w) for w in negative)
        sentiment = "positive" if pos_count > neg_count else "negative" if neg_count > pos_count else "neutral"
        # Key topics extraction (top TF-IDF terms)
        try:
            vec = self.tfidf.transform([transcript])
            feature_names = self.tfidf.get_feature_names_out()
            scores = vec.toarray()[0]
            top_indices = scores.argsort()[-8:][::-1]
            key_topics = [feature_names[i] for i in top_indices if scores[i] > 0]
        except:
            key_topics = []
        return {
            "clarity": clarity,
            "filler_words": filler_count,
            "filler_rate": round(filler_rate, 2),
            "sentiment": sentiment,
            "word_count": word_count,
            "key_topics": key_topics[:5],
            "grade": self.score_to_grade(clarity)
        }

    def get_sector_insights(self, sector: str):
        """ML-based sector insights"""
        sector_descriptions = [d for d, s in zip(TRAINING_DATA["descriptions"], TRAINING_DATA["sectors"]) if s == sector]
        avg_success = np.mean([
            self.predict_success(500000, 8, 5, 500, "seed", sector)
            for _ in range(3)
        ])
        return {
            "sector": sector,
            "avg_success_probability": round(avg_success, 1),
            "total_in_training": len(sector_descriptions),
            "competition_density": "high" if len(sector_descriptions) > 3 else "medium" if len(sector_descriptions) > 1 else "low",
            "hot_keywords": self._get_sector_keywords(sector_descriptions)
        }

    def _get_sector_keywords(self, descriptions):
        if not descriptions: return []
        try:
            vecs = self.tfidf.transform(descriptions)
            mean_vec = vecs.mean(axis=0).A1
            feature_names = self.tfidf.get_feature_names_out()
            top = mean_vec.argsort()[-6:][::-1]
            return [feature_names[i] for i in top if mean_vec[i] > 0]
        except:
            return []

