// Image.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import './Image.css';
import { API_BASE_URL } from './config';

function ImagePage() {
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ko');

  const languageNames = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
    es: 'Español'
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const supported = [
      'image/jpeg','image/png',
      'application/pdf','text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!supported.includes(file.type)) {
      return alert('지원 형식: JPG, PNG, PDF, TXT, DOCX');
    }

    setPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    setOcrText('');
    setTranslation('');
    setLoading(true);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('source_lang', sourceLang);
      form.append('target_lang', targetLang);

      const res = await fetch(`${API_BASE_URL}/api/ocr-translate`, {
        method: 'POST',
        body: form
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setOcrText(data.ocrText);
      setTranslation(data.translation);
    } catch (err) {
      console.error('OCR/번역 에러:', err);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="header"><h1>Mindy</h1></header>
      <Container className="py-4">
        <Row className="gy-4">
          {/* 왼쪽: 업로드 & 미리보기 */}
          <Col md={6}>
            <Card>
              <Card.Header>이미지 업로드 &amp; 미리보기</Card.Header>
              <Card.Body className="text-center">
                {preview ? (
                  <Card.Img
                    variant="top"
                    src={preview}
                    style={{ maxHeight: 300, objectFit: 'contain' }}
                  />
                ) : (
                  <div className="bg-light border rounded py-5">
                    미리보기 영역
                  </div>
                )}
                <Form.Group className="mt-3">
                  <Form.Label>원문 언어</Form.Label>
                  <Form.Select
                    value={sourceLang}
                    onChange={e => setSourceLang(e.target.value)}
                    disabled={loading}
                  >
                    <option value="en">English</option>
                    <option value="ko">한국어</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="es">Español</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mt-2">
                  <Form.Label>번역 언어</Form.Label>
                  <Form.Select
                    value={targetLang}
                    onChange={e => setTargetLang(e.target.value)}
                    disabled={loading}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="es">Español</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="formFile" className="mt-3">
                  <Form.Control
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.txt,.docx"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* 오른쪽: OCR & 번역 결과 */}
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                인식한 텍스트 ({languageNames[sourceLang]})
              </Card.Header>
              <Card.Body>
                <Form.Control
                  as="textarea"
                  rows={6}
                  readOnly
                  value={ocrText}
                  placeholder="여기에 OCR 결과가 표시됩니다"
                />
              </Card.Body>
            </Card>
            <Card>
              <Card.Header>
                번역 텍스트 ({languageNames[targetLang]})
              </Card.Header>
              <Card.Body>
                <Form.Control
                  as="textarea"
                  rows={6}
                  readOnly
                  value={translation}
                  placeholder="여기에 번역 결과가 표시됩니다"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ImagePage;
