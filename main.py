from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import re
from collections import Counter

app = FastAPI()

sentiment_pipeline = pipeline("sentiment-analysis")

class Feedback(BaseModel):
    text: str

def extract_keywords(text: str, top_n: int = 5):
    stopwords = set([
        'the', 'and', 'is', 'in', 'it', 'of', 'to', 'a', 'for', 'that', 'on',
        'this', 'with', 'as', 'was', 'but', 'are', 'be', 'have', 'not'
    ])
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    keywords = [word for word in words if word not in stopwords]
    return [word for word, _ in Counter(keywords).most_common(top_n)]

@app.post("/analyze")
def analyze_feedback(feedback: Feedback):
    sentiment = sentiment_pipeline(feedback.text)[0]
    keywords = extract_keywords(feedback.text)
    return {
        "sentiment": sentiment,
        "keywords": keywords
    }
