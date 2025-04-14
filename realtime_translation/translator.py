import speech_recognition as sr # 음성 인식을 위한 라이브러리
# import speech_recognition as sr       
from googletrans import Translator      # 텍스트 번역을 위한 라이브러리 (Google Translate API 비공식 래퍼)
from gtts import gTTS                   # 텍스트를 음성으로 변환(TTS)를 위한 라이브러리 (Google TTS)
import playsound                        # 생성된 오디오 파일을 재생하기 위한 라이브러리
import os

def get_audio():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("say something")
        audio = r.listen(source)
        said = " "

        try:
            said = r.recognize_google(audio, language="ko-KR")
            print("Your sppech thinks like: ", said)
        except Exception as e:
            print("입력된 음성이 없습니다.")
            return 0
            # print("Exception: " + str(e))

    return said

# 1. 음성입력
text=get_audio()
if text == 0: exit(0)

# 2. 기계 번역: 한글 텍스트를 영어 텍스트로 번역
translator = Translator()
translated = translator.translate(text, src='ko', dest='en')
print("번역된 텍스트:", translated.text)

# 3. 음성 합성: 영어 텍스트를 영어 음성으로 변환하여 파일로 저장하고 재생
tts = gTTS(translated.text, lang='en')
audio_file = "output.mp3"
tts.save(audio_file)
playsound.playsound(audio_file)

# 옵션: 재생 후 파일 삭제
os.remove(audio_file)
