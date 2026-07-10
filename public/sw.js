// 최소 service worker — PWA 설치 가능(installability) 조건 충족용.
// Chrome 계열은 fetch 핸들러를 가진 SW가 있어야 beforeinstallprompt를 발생시킨다.
// 오프라인 캐싱은 하지 않는다(네트워크 그대로 통과) — 설치 프롬프트 활성화가 목적.

self.addEventListener("install", () => {
  // 새 SW를 즉시 활성화(대기 없이).
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // 활성화되면 열린 모든 탭을 이 SW가 곧바로 제어.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // 요청을 가로채지 않고 브라우저 기본 동작에 맡긴다.
  // (핸들러 존재 자체가 installability 판정에 필요하다.)
});
