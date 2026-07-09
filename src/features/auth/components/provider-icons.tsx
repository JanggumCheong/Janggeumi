/**
 * SNS 제공자 브랜드 아이콘 (인라인 SVG).
 * 제공자 브랜드 가이드 색상은 디자인 토큰의 유일한 예외다.
 */
import type { SVGProps } from "react";

export function KakaoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 3.4c-5.13 0-9.3 3.27-9.3 7.3 0 2.6 1.74 4.87 4.35 6.15-.14.5-.9 3.1-.93 3.3 0 0-.02.16.09.22a.28.28 0 0 0 .23.02c.29-.04 3.36-2.2 3.9-2.57.54.08 1.1.12 1.66.12 5.13 0 9.3-3.27 9.3-7.26 0-4.03-4.17-7.3-9.3-7.3Z" />
    </svg>
  );
}

export function NaverIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M14.6 3v9.6L9.2 3H3v18h6.4v-9.6L14.8 21H21V3z" />
    </svg>
  );
}

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.11-6.7-4.94H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.31c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.6H1.29A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.29 5.4z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l4.01 3.09C6.24 6.86 8.88 4.75 12 4.75z"
      />
    </svg>
  );
}
