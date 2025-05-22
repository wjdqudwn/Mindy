// src/App.js
import React, { useState } from 'react'; 
import {
  Container,
  Row,
  Col,
  Card,
  Form
} from 'react-bootstrap';
import './Image.css'

function ImagePage() {
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [translation, setTranslation] = useState('');
  const [, setLoading] = useState(false);

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    // 미리보기 띄우기
    setPreview(URL.createObjectURL(file));
    // FormData에 파일 담기
    const formData = new FormData();
    formData.append('image', file);
    //이전 인식된 텍스트 초기화
    try {
      setLoading(true);
      setOcrText('');
      setTranslation('');
    // 백엔드로 Post 요청
    const res = await fetch('/api/ocr-translate', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(res.statusText);
    // JSON 응답 파싱
    const data = await res.json();

    // 상태 업데이트
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
      {/* Header */}
      <header className='header'><h1>Mindy</h1></header>
      
      {/* Main Content */}
      <Container className="py-4">
        <Row className="gy-4">
          {/* 왼쪽: 이미지 업로드 & 미리보기 */}
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

                <Form.Group controlId="formFile" className="mt-3">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* 오른쪽: OCR 결과 & 번역 결과 */}
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>인식한 텍스트 (영어): </Card.Header>
              <Card.Body>
                <Form.Control
                  as="textarea"
                  rows={6}
                  onChange={e => setOcrText(e.target.value)}
                  placeholder="여기에 글자 인식 결과가 표시됩니다"
                  value={ocrText}
                />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>번역 텍스트 (한국어): </Card.Header>
              <Card.Body>
                <Form.Control
                  as="textarea"
                  rows={6}
                  readOnly
                  placeholder="여기에 번역 결과가 표시됩니다"
                  value={translation}
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