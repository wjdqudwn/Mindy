# 실시간 음성 번역 기능_1차

한글 음성을 영어 음성으로 번역하는 Python 프로젝트입니다. (설정에 따라 FROM, TO 언어 모두 변경 가능)

## 설치 방법

필요한 라이브러리 설치를 위해 다음 명령어를 실행합니다.

```bash
pip install SpeechRecognition
pip install googletrans==4.0.0-rc1
pip install gTTS
pip install playsound
pip install pyaudio
```

## 실행 방법

```text
파이썬 코드가 실행가능한 IDE 에서 실행

OR

터미널에서 python translation.py
```

- 마이크를 통해 한글 음성을 입력하면 영어 음성으로 출력됩니다.
