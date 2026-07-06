# Janggeumi

장금이

## Next.js 개발 환경

```bash
npm install
npm run dev
```

개발 서버는 기본값으로 `http://localhost:3000`에서 실행됩니다.

## FastAPI 백엔드 초기 세팅

별도 백엔드 서버를 띄우려면 다음처럼 실행하면 됩니다.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows는 .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

백엔드 기본 주소는 `http://localhost:8000`이며,
- `GET /` : 서버 상태 확인
- `GET /health` : 헬스체크

## 사용 스택

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- ESLint
- FastAPI
- Uvicorn
