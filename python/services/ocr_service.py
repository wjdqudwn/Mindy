from PIL import Image
import pytesseract
import pdf2image
import docx

class OCRService:
    def __init__(self):
        # tesseract 명령어 경로 (시스템 설정에 맞게 조정 필요)
        pytesseract.pytesseract.tesseract_cmd = 'tesseract'

    async def extract_text(self, file) -> str:
        """
        업로드된 파일(file.filename, file.file)에 대해
        - PDF → 각 페이지를 이미지로 변환 후 OCR
        - DOCX → python-docx 로 텍스트 추출
        - TXT → plain text 읽기
        - 그 외(image) → PIL → OCR
        """
        try:
            # 확장자 판단
            filename = getattr(file, 'filename', '')
            ext = filename.rsplit('.', 1)[-1].lower()

            if ext == 'pdf':
                images = pdf2image.convert_from_bytes(await file.read())
                text = ''.join(pytesseract.image_to_string(img, lang='eng') for img in images)

            elif ext == 'docx':
                # file.file 대신 await file.read()를 BytesIO로 감싸도 무방
                document = docx.Document(await file.read())
                text = '\n'.join(para.text for para in document.paragraphs)

            elif ext == 'txt':
                raw = await file.read()
                text = raw.decode('utf-8', errors='ignore')

            else:
                # 이미지(jpg/png 등)
                # file.file이 SpooledTemporaryFile이라면 read() 후 BytesIO로 열기
                from io import BytesIO
                data = await file.read()
                image = Image.open(BytesIO(data))
                text = pytesseract.image_to_string(image, lang='eng')

            return text.strip()

        except Exception as e:
            raise RuntimeError(f"OCR processing error: {e}")
