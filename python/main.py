from fastapi import FastAPI, Form, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn, nest_asyncio

from services.stt_tts_service import STT_TTSService
from services.translation_service import TranslationService
from services.ocr_service import OCRService
from services.cleanNoise import clean_noise_from_base64

nest_asyncio.apply()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서비스 인스턴스
stt_tts = STT_TTSService()          # whisper large + gTTS 포함
translator = TranslationService()   # LibreTranslate or googletrans 등
ocr_service = OCRService()

@app.post("/api/clean-noise")
async def clean_noise(audio_data: str = Form(...)):
    try:
        cleaned_b64 = clean_noise_from_base64(audio_data)
        return {"cleanedAudio": cleaned_b64}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/stt")
async def stt(
    audio_data: str = Form(...),
    source_lang: str = Form(...)
):
    """
    1) audio_data(Base64) → 노이즈제거 → Whisper(STT) → 텍스트 반환
    """
    # 1. 노이즈 제거
    cleaned = clean_noise_from_base64(audio_data)
    # 2. STT
    text = await stt_tts.speech_to_text(cleaned, source_lang)
    return {"recognizedText": text, "cleanedAudio": cleaned}


@app.post("/api/translate-text")
async def translate_text(
    text: str = Form(...),
    source_lang: str = Form(...),
    target_lang: str = Form(...)
):
    """
    2) 순수 텍스트 번역만 수행
    """
    translated = await translator.translate(text, source_lang, target_lang)
    return {"translatedText": translated}


# (선택) 서버 사이드 TTS가 필요하다면 남겨두세요.
@app.post("/api/tts")
async def tts(
    text: str = Form(...),
    target_lang: str = Form(...)
):
    """
    3) 번역된 텍스트 → gTTS(Base64) 반환
    """
    audio_b64 = await stt_tts.text_to_speech(text, target_lang)
    return {"audioData": audio_b64}


@app.post("/api/ocr-translate")
async def ocr_translate(
    file: UploadFile = File(...),
    source_lang: str = Form(...),
    target_lang: str = Form(...)
):
    try:
        # 1. OCR 추출
        ocr_text = await ocr_service.extract_text(file)
        # 2. 번역
        translated = await translator.translate(ocr_text, source_lang, target_lang)
        return {"ocrText": ocr_text, "translation": translated}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    try:
        from pyngrok import ngrok
        public_url = ngrok.connect(8000, "http")
        print(f"[NGROK URL] {public_url.public_url}")
    except Exception as e:
        print("[NGROK ERROR]", e)
    uvicorn.run(app, host="0.0.0.0", port=8000)
