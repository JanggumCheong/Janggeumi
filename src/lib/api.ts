/**
 * 백엔드 API base URL 분기.
 *
 * - 로컬 개발: env 미설정 → `http://127.0.0.1:8000` 폴백
 * - 배포(Vercel 등): `NEXT_PUBLIC_API_URL` 에 배포된 백엔드 주소 주입
 *
 * FastAPI 백엔드가 아직 배포되지 않았으므로, 배포 환경에서는
 * 환경변수가 채워질 때까지 폴백 주소로 남는다(로컬에서만 실제 연결).
 */

const DEFAULT_LOCAL_API = "http://127.0.0.1:8000";

/** 끝 슬래시 제거해 base를 정규화한다. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_LOCAL_API
).replace(/\/$/, "");

/** base + path 결합. path는 "/" 로 시작. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
