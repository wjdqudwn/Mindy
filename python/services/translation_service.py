# services/translation_service.py
from googletrans import Translator

class TranslationService:
    """
    googletrans (공짜) 를 쓰는 번역 서비스
    """
    def __init__(self):
        self.translator = Translator()

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        # 빈 문자열 또는 동일 언어는 그대로
        if not text or source_lang == target_lang:
            return text or ""
        # googletrans 의 translate() 는 동기 메서드라서 그냥 호출
        result = self.translator.translate(text, src=source_lang, dest=target_lang)
        return result.text
