
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... (Word List Omitted for Brevity - Assume 10k+) ...
# In real implementation, this would read from `words.txt`
WORD_LIST = ["APPLE", "BEACH", "BRAIN", "SPEED", "LEVEL", "ENTER"] # Extended...

class ValidationRequest(BaseModel):
    guess: str
    target: str

class ValidationResponse(BaseModel):
    results: List[str]
    invalid_word: bool

@app.post("/api/validate", response_model=ValidationResponse)
def validate_guess(req: ValidationRequest):
    """
    JULES APPROVED VALIDATION LOGIC
    Handles double letters correctly like official NYT Wordle.
    """
    guess = req.guess.upper()
    target = req.target.upper()
    
    if len(guess) != 5:
        return {"results": [], "invalid_word": True}
        
    # In production, check full dictionary here
    # if guess not in FULL_DICT: return ...

    results = ["absent"] * 5
    
    # Track available letters in target (handles duplicates)
    target_counts = {}
    for char in target:
        target_counts[char] = target_counts.get(char, 0) + 1

    # PASS 1: Find GREENS (Correct Positions) first
    for i in range(5):
        letter = guess[i]
        if letter == target[i]:
            results[i] = "correct"
            target_counts[letter] -= 1

    # PASS 2: Find YELLOWS (Wrong Position) using remaining counts
    for i in range(5):
        letter = guess[i]
        if results[i] == "absent": # Only check if not already Green
            if letter in target_counts and target_counts[letter] > 0:
                results[i] = "present"
                target_counts[letter] -= 1

    return {
        "results": results, 
        "invalid_word": False
    }

# Health Check Added by Jules
@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "1.0.1 (Jules Patched)"}
