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
    # English stopwords
    'the', 'and', 'is', 'in', 'it', 'of', 'to', 'a', 'for', 'that', 'on',
    'this', 'with', 'as', 'was', 'but', 'are', 'be', 'have', 'not',
    
    # Swedish stopwords
    'och', 'det', 'att', 'i', 'en', 'jag', 'hon', 'som', 'han', 'på',
    'den', 'med', 'var', 'sig', 'för', 'så', 'till', 'är', 'men', 'ett',
    'om', 'hade', 'de', 'av', 'icke', 'mig', 'du', 'henne', 'då', 'sin',
    'nu', 'har', 'inte', 'hans', 'honom', 'skulle', 'hennes', 'där',
    'min', 'man', 'ej', 'vid', 'kunde', 'något', 'från', 'ut', 'när',
    'efter', 'upp', 'vi', 'dem', 'vara', 'vad', 'över', 'än', 'dig',
    'kan', 'sina', 'här', 'ha', 'mot', 'alla', 'under', 'någon', 'allt',
    'mycket', 'sedan', 'ju', 'denna', 'själv', 'detta', 'åt', 'utan',
    'varit', 'hur', 'ingen', 'mitt', 'ni', 'bli', 'blev', 'oss', 'din',
    'dessa', 'några', 'deras', 'blir', 'mina', 'samma', 'vilken', 'er',
    'sådan', 'vår', 'blivit', 'dess', 'inom', 'mellan', 'sådant', 'varför',
    'varje', 'vilka', 'ditt', 'vem', 'vilket', 'sitta', 'sådana', 'vart',
    'dina', 'vars'
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
