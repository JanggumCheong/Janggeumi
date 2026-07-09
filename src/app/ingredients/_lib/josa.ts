/**
 * 한글 조사(助詞) 선택 — 앞 글자 받침 유무로 이/가, 은/는, 을/를 등을 고른다.
 * 재료명이 받침 없는 것(사과·아보카도)일 때 "사과이" 같은 어색함을 막는다.
 */

/** 마지막 글자에 받침(종성)이 있으면 true. 한글이 아니면 받침 있는 것으로 간주(보수적). */
function hasFinalConsonant(word: string): boolean {
  const last = word.trim().at(-1);
  if (!last) return false;
  const code = last.charCodeAt(0);
  // 한글 음절 범위(가~힣): (코드-0xAC00) % 28 !== 0 이면 종성 있음
  if (code < 0xac00 || code > 0xd7a3) return true;
  return (code - 0xac00) % 28 !== 0;
}

/** 주격 조사: 받침 있으면 "이", 없으면 "가". (예: 수박이 / 사과가) */
export function subjectParticle(word: string): string {
  return hasFinalConsonant(word) ? "이" : "가";
}
