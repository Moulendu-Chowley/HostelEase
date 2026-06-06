"""
HostelEase DeepFace Recognition Service
Run: python main.py
Requires: pip install -r requirements.txt
"""

import base64
import io
import os
import tempfile
from pathlib import Path

import uvicorn
from deepface import DeepFace
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

app = FastAPI(title="HostelEase DeepFace Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FACES_DIR = Path(os.getenv("FACES_DIR", str(Path(__file__).parent / "faces_db")))
FACES_DIR.mkdir(parents=True, exist_ok=True)

MODEL_NAME = "ArcFace"          # Fast and accurate
DISTANCE_METRIC = "cosine"
THRESHOLD = float(os.getenv("RECOGNITION_THRESHOLD", "0.65"))


# ── helpers ──────────────────────────────────────────────────────────────────

def decode_b64_to_path(b64_str: str, path: Path) -> None:
    """Decode a Base64 image string (with or without data-URL header) and save as JPEG."""
    if "," in b64_str:
        b64_str = b64_str.split(",", 1)[1]
    data = base64.b64decode(b64_str)
    img = Image.open(io.BytesIO(data)).convert("RGB")
    img.save(str(path), "JPEG", quality=95)


# ── schemas ───────────────────────────────────────────────────────────────────

class RecognizeRequest(BaseModel):
    frame_b64: str  # Base64-encoded JPEG or PNG from the webcam


class RecognizeResponse(BaseModel):
    matched: bool
    student_id: str | None = None
    confidence: float = 0.0
    message: str = ""


class RegisterFaceRequest(BaseModel):
    image_b64: str  # Base64-encoded photo of the student


# ── endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    faces = list(FACES_DIR.glob("*.jpg"))
    return {
        "status": "ok",
        "faces_registered": len(faces),
        "faces_dir": str(FACES_DIR),
        "model": MODEL_NAME,
        "threshold": THRESHOLD,
    }


@app.put("/faces/{student_id}")
def register_face(student_id: str, body: RegisterFaceRequest):
    """Save or update a student's reference face image."""
    path = FACES_DIR / f"{student_id}.jpg"
    try:
        decode_b64_to_path(body.image_b64, path)
        return {"message": f"Face registered for {student_id}", "path": str(path)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.delete("/faces/{student_id}")
def delete_face(student_id: str):
    """Remove a student's reference face image."""
    path = FACES_DIR / f"{student_id}.jpg"
    if path.exists():
        path.unlink()
    return {"message": f"Face removed for {student_id}"}


@app.post("/recognize", response_model=RecognizeResponse)
def recognize(body: RecognizeRequest):
    """
    Identify a student from a webcam frame.
    Compares the frame against every registered face and returns the best match
    if the cosine distance is within the configured threshold.
    """
    face_files = list(FACES_DIR.glob("*.jpg"))
    if not face_files:
        return RecognizeResponse(matched=False, message="No faces registered yet")

    # Write incoming frame to a temp file so DeepFace can load it
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    try:
        decode_b64_to_path(body.frame_b64, tmp_path)

        best_student_id: str | None = None
        best_distance = float("inf")

        for face_file in face_files:
            try:
                result = DeepFace.verify(
                    img1_path=str(tmp_path),
                    img2_path=str(face_file),
                    model_name=MODEL_NAME,
                    distance_metric=DISTANCE_METRIC,
                    enforce_detection=False,  # don't crash if no face detected
                )
                distance = float(result["distance"])
                print(f"DEBUG: Comparing with student {face_file.stem}: distance = {distance:.4f} (threshold = {THRESHOLD:.2f})")
                if distance < best_distance:
                    best_distance = distance
                    best_student_id = face_file.stem  # filename without .jpg == student UUID
            except Exception as e:
                print(f"DEBUG: Error comparing with {face_file.name}: {e}")
                continue  # skip unreadable or undetectable images

        if best_student_id and best_distance <= THRESHOLD:
            # Map distance to a [0.5, 0.99] confidence score
            confidence = round(max(0.5, 1.0 - (best_distance / THRESHOLD) * 0.5), 3)
            return RecognizeResponse(
                matched=True,
                student_id=best_student_id,
                confidence=min(confidence, 0.99),
            )

        return RecognizeResponse(matched=False, message="No match found")

    finally:
        tmp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
