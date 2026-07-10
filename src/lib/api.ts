/**
 * 백엔드 API base URL 분기.
 *
 * - 기본값: Render에 배포된 백엔드 주소
 * - 로컬 개발/다른 배포: `NEXT_PUBLIC_API_URL`로 base URL 덮어쓰기
 */

const DEFAULT_API = "https://janggeumi.onrender.com";

/** 끝 슬래시 제거해 base를 정규화한다. */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API).replace(/\/$/, "");

/** base + path 결합. path는 "/" 로 시작. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
