"""
ECHOFORGE PRO SERVER
The "Local 11Labs" API Provider
"""

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
from voice_engine import EchoForgeEngine

# Initialize App & Engine
app = FastAPI(title="EchoForge Pro API", version="1.0.0")
engine = EchoForgeEngine()

# --- SECURITY (Simple License Key for now) ---
VALID_LICENSE_KEYS = ["ECHO-DEV-KEY-123", "ECHO-PRO-LICENSE-XYZ"]

def verify_key(x_api_key: str = Header(...)):
    if x_api_key not in VALID_LICENSE_KEYS:
        raise HTTPException(status_code=401, detail="Invalid License Key")
    return x_api_key

# --- MODELS ---
class SynthesisRequest(BaseModel):
    text: str
    voice_id: str = "en_US-amy-medium"
    speed: float = 1.0
    pitch: float = 1.0

class CloneRequest(BaseModel):
    name: str
    source_file: str # Path to audio file on server

# --- ENDPOINTS ---

@app.get("/")
def health_check():
    return {"status": "online", "engine": "EchoForge Pro", "version": "1.0.0"}

@app.get("/v1/voices")
def list_voices(key: str = Depends(verify_key)):
    """List all available voices (Built-in + Cloned)"""
    # In reality, scan the 'voices' directory
    return {
        "built_in": engine.piper_voices,
        "cloned": [f.replace(".json", "") for f in os.listdir("voices") if f.endswith(".json")]
    }

@app.post("/v1/synthesize")
def synthesize_speech(req: SynthesisRequest, key: str = Depends(verify_key)):
    """Generate Audio from Text"""
    try:
        # Generate audio using the engine
        # Note: In a real app, we'd handle the pitch/speed params in the engine
        output_file = engine.generate_speech(req.text, req.voice_id)
        
        return FileResponse(output_file, media_type="audio/wav", filename="output.wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/clone")
def clone_voice(req: CloneRequest, key: str = Depends(verify_key)):
    """Clone a voice from a file"""
    try:
        profile = engine.clone_voice(req.source_file, req.name)
        return {"status": "success", "voice_id": req.name, "profile": profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 EchoForge Server Starting on http://localhost:5555")
    uvicorn.run(app, host="0.0.0.0", port=5555)
