from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import re
from collections import Counter
from utils import STOPWORDS
import os
import signal
import uvicorn
from contextlib import asynccontextmanager
import asyncio
from typing import List

# Global variables for graceful shutdown
shutdown_event = asyncio.Event()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load the model
    print("Loading sentiment analysis model...")
    app.state.sentiment_pipeline = pipeline("sentiment-analysis")
    print("Model loaded successfully!")
    
    yield
    
    # Shutdown: Clean up resources
    print("Shutting down gracefully...")
    shutdown_event.set()
    # Wait for ongoing requests to complete (up to 10 seconds)
    try:
        await asyncio.wait_for(shutdown_event.wait(), timeout=10.0)
    except asyncio.TimeoutError:
        print("Shutdown timed out, forcing exit")

app = FastAPI(lifespan=lifespan)

# Get allowed origins from environment variable
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Feedback(BaseModel):
    text: str

def extract_keywords(text: str, top_n: int = 5) -> List[str]:
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    keywords = [word for word in words if word not in STOPWORDS]
    return [word for word, _ in Counter(keywords).most_common(top_n)]

@app.post("/analyze")
async def analyze_feedback(feedback: Feedback, request: Request):
    # Check if we're shutting down
    if shutdown_event.is_set():
        raise HTTPException(status_code=503, detail="Service is shutting down")
    
    try:
        sentiment = app.state.sentiment_pipeline(feedback.text)[0]
        keywords = extract_keywords(feedback.text)
        return {
            "sentiment": sentiment,
            "keywords": keywords
        }
    except Exception as e:
        # Log the error and return a 500 response
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run"""
    return {"status": "healthy"}

def handle_sigterm(*_):
    """Handle SIGTERM signal from Cloud Run"""
    print("Received SIGTERM signal")
    asyncio.create_task(shutdown_event.set())

if __name__ == "__main__":
    # Register signal handlers
    signal.signal(signal.SIGTERM, handle_sigterm)
    
    # Get port from environment variable, default to 8000 for local development
    port = int(os.getenv("PORT", 8000))
    
    # Configure uvicorn for Cloud Run
    config = uvicorn.Config(
        app=app,
        host="0.0.0.0",
        port=port,
        # Cloud Run specific settings
        timeout_keep_alive=65,  # Slightly higher than Cloud Run's 60s timeout
        limit_concurrency=80,   # Adjust based on your Cloud Run instance's CPU/memory
        workers=1,              # Cloud Run manages scaling, so we use a single worker
    )
    
    server = uvicorn.Server(config)
    server.run()
