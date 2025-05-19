from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import re
from collections import Counter
from utils import STOPWORDS

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # default pprt
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sentiment_pipeline = pipeline("sentiment-analysis")

class Feedback(BaseModel):
    text: str

def extract_keywords(text: str, top_n: int = 5):
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    keywords = [word for word in words if word not in STOPWORDS]
    return [word for word, _ in Counter(keywords).most_common(top_n)]

@app.post("/analyze")
def analyze_feedback(feedback: Feedback):
    sentiment = sentiment_pipeline(feedback.text)[0]
    keywords = extract_keywords(feedback.text)
    return {
        "sentiment": sentiment,
        "keywords": keywords
    }
