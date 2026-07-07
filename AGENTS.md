# Janggeumi Codex Guide

이 레포에서 작업할 때는 `.claude`에 정리된 프로젝트 지식도 Codex 작업 기준으로 사용한다.

## Project Context

- `.claude/CLAUDE.md`: 기존 Claude용 프로젝트 진입 문서
- `.claude/skills/design/SKILL.md`: 장금이 화면, 컴포넌트, HTML 목업 작업 기준
- `.claude/skills/product/SKILL.md`: 장금이 기능 기획서, PRD, 시각화 HTML 작업 기준
- `.claude/skills/content/schema.md`: 식재료 콘텐츠 JSON/API 스키마 기준
- `.claude/skills/content/list.json`: 현재 관리 중인 식재료 콘텐츠 목록
- `.claude/skills/content/examples/`: 재료별 콘텐츠 예시

## Codex Usage

- 디자인, 목업, UI 시안 요청은 `.claude/skills/design/SKILL.md`를 먼저 읽고 따른다.
- 기능 기획, PRD, 기능 정리 요청은 `.claude/skills/product/SKILL.md`를 먼저 읽고 따른다.
- 식재료 데이터, 콘텐츠 JSON, 구매/보관/처리 스키마 작업은 `.claude/skills/content/schema.md`와 예시 JSON을 기준으로 한다.
- 같은 자료는 Codex용 로컬 경로 `.codex/skills/`에도 복사되어 있다. 둘 사이 내용이 다르면 `.claude/skills/`를 원본으로 본다.

## Development

- 프론트엔드: Next.js App Router
- 주요 라우트: `/`, `/search`, `/ingredients/[slug]`, `/ingredients/[slug]/[tab]`
- 검증 명령:
  - `npm run format:check`
  - `npm run lint`
  - `npm run build`

## GitHub Issue Format

이 레포에서 GitHub 이슈를 생성할 때는 아래 형식을 기본으로 사용한다.

1. 첫 문단에 이슈의 핵심 작업을 한 문장으로 요약한다.
2. `## 목표` 섹션에 이슈로 달성하려는 상태를 적는다.
3. `## 작업 내용` 섹션에 번호가 있는 하위 항목으로 구체적인 작업을 정리한다.
4. `## 산출물` 섹션에 생성되거나 수정될 파일, 문서, 화면, 설정을 적는다.
5. `## 다음 (후속)` 섹션에 이번 이슈 이후 이어질 작업을 적는다.

권장 템플릿:

```markdown
<이슈의 핵심 작업을 한 문장으로 요약>

## 목표

<달성하려는 상태>

## 작업 내용

### 1. <작업 영역>

- <구체 작업>
- <구체 작업>

### 2. <작업 영역>

- <구체 작업>
- <구체 작업>

## 산출물

- `<파일 또는 경로>`
- `<파일 또는 경로>`

## 다음 (후속)

- <후속 작업>
- <후속 작업>
```

제목은 작업 성격에 맞는 conventional prefix를 붙인다. 예: `[Chore]`, `[Feat]`, `[Fix]`, `[Docs]`.
