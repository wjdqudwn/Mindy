import React, { useState, useRef } from 'react';
import './App.css';

function Home() {
  const [recording, setRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const [sourceLang, setSourceLang] = useState('ko');
  const [targetLang, setTargetLang] = useState('en');

  const [micPermissionError, setMicPermissionError] = useState('');
  const [isTranslating, setIsTranslating] = useState(false); // 1. 로딩 상태 추가

  const languageNames = {
    ko: '한국어',
    en: '영어',
    ja: '일본어',
    zh: '중국어',
    es: '스페인어'
  };

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const clearTranslation = () => {
    setRecognizedText(''); // 인식된 텍스트도 함께 초기화할지 결정 (선택 사항)
    setTranslatedText('');
  };


  const handleRecordClick = async () => {
    if (!recording) {
      // 녹음 시작 전, 이전 오류 메시지 초기화
      setMicPermissionError('');

      try {
        // 녹음 시작
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        audioChunksRef.current = []; // 새 녹음 시작 시 청크 배열 초기화

        mr.ondataavailable = e => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mr.onstop = async () => {
          if (audioChunksRef.current.length === 0) {
            console.log("녹음된 오디오 데이터가 없습니다.");
            setRecording(false);
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            return;
          }

          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const form = new FormData();
          form.append('file', blob, 'speech.webm');
          form.append('sourceLang', sourceLang);
          form.append('targetLang', targetLang);

          setIsTranslating(true);
          setTranslatedText('');

          try {
            const res = await fetch('/api/translate', {
              method: 'POST',
              body: form
            });
            if (!res.ok) {
              // 서버 응답 오류 처리
              const errorData = await res.text(); // 또는 res.json()
              console.error("번역 API 오류:", errorData);
              setMicPermissionError(`번역 서버 오류: ${res.statusText}. 잠시 후 다시 시도해주세요.`);
              setRecognizedText('');
              setTranslatedText('');
              return; // 오류 발생 시 추가 진행 중단
            }
            const data = await res.json();
            setRecognizedText(data.recognizedText);
            setTranslatedText(data.translatedText);
            setMicPermissionError(''); // 성공 시 API 에러 메시지 제거
          } catch (apiError) { // 'error' 대신 'apiError' 사용 (일관성을 위해 error로 통일해도 무방)
            console.error("API 호출 중 네트워크 오류 또는 JSON 파싱 오류:", apiError);
            setMicPermissionError('번역 요청 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
            setRecognizedText('');
            setTranslatedText('');
          } finally {
            setIsTranslating(false);
            setRecording(false); // API 호출 후 녹음 상태 최종적으로 false
            // 스트림 트랙 중지 (마이크 사용 해제)
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
          }
        };

        mr.start();
        setRecording(true);

      } catch (error) { // getUserMedia 오류 객체 이름은 'error'
        console.error("마이크 접근 오류:", error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setMicPermissionError('마이크 권한이 거부되었습니다. 브라우저 또는 시스템 설정에서 마이크 접근을 허용해주세요.');
        } else if (error.name === 'NotFoundError') {
          setMicPermissionError('사용 가능한 마이크를 찾을 수 없습니다. 마이크가 올바르게 연결되어 있는지 확인해주세요.');
        } else {
          setMicPermissionError('마이크를 시작하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        setRecording(false); // 오류 발생 시 녹음 상태 false로 확실히 설정
      }
    } else {
      // 녹음 정지
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        // onstop 이벤트 핸들러에서 setRecording(false) 및 스트림 정리를 하므로 여기서 중복 호출 피함
      } else {
        // 이미 중지되었거나 mediaRecorder가 없는 경우 (예: 권한 거부 후 버튼을 다시 누른 경우 등)
        setRecording(false);
      }
    }
  };

  return (
    <div className="App">
      <header><h1>Mindy</h1></header>

      <button
        className={`mic-button ${recording ? 'recording' : ''}`}
        onClick={handleRecordClick}
        disabled={isTranslating}
      >
        {recording ? '■' : '🎤'}
      </button>

      {/* 마이크 권한 오류 메시지 표시 */}
      {micPermissionError && (
        <div className="error-message mic-error-message"> {/* App.css에 스타일 정의 필요 */}
          {micPermissionError}
        </div>
      )}

      <div className="boxes">
        <div className="lang-selectors">
          <label>
            STT 언어:&nbsp;
            <select value={sourceLang} onChange={e => { setSourceLang(e.target.value); clearTranslation(); }}>
              disabled={isTranslating || recording}
              <option value="ko">🇰🇷 한국어</option>
              <option value="en">영어</option>
              <option value="ja">일본어</option>
              <option value="zh">중국어</option>
              <option value="es">스페인어</option>
            </select>
          </label>
          &nbsp;
          <label>
            번역 언어:&nbsp;
            <select value={targetLang} onChange={e => { setTargetLang(e.target.value); clearTranslation(); /* 번역 언어 변경 시 기존 번역 결과 초기화 */ }}>
              disabled={isTranslating || recording}
              <option value="en">영어</option>
              <option value="ko">한국어</option>
              <option value="ja">일본어</option>
              <option value="zh">중국어</option>
              <option value="es">스페인어</option>
            </select>
          </label>
        </div>

        <div className="box">
          <h2>인식한 텍스트 ({languageNames[sourceLang]}):</h2>
          <textarea
            readOnly
            value={recognizedText}
            placeholder="인식 결과가 표시됩니다"
          />

          {/* 번역 초기화 버튼 위치는 CSS로 조정 */}
          <div className="reset-wrapper">
            <button className="reset-button" onClick={clearTranslation}>
              번역 초기화
            </button>
          </div>

          <h2>번역 텍스트 ({languageNames[targetLang]}):</h2>
          {isTranslating ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>번역이 진행 중입니다. 잠시만 기다려 주세요...</p>
            </div>
          ) : (
            <textarea
              readOnly
              value={translatedText}
              placeholder="번역 결과가 표시됩니다"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;