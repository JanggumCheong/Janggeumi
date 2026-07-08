import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

/**
 * 에러/빈 상태 공통 프레젠테이션 — 404·재료 상세 에러·전역 에러가 같은 레이아웃을 공유한다.
 * 장금이 일러스트 → 제목 → 보조 문구 → 액션(primary/secondary) 세로 스택.
 *
 * 화면마다 다른 건 일러스트·카피·액션뿐이라 여기로 모아 응집한다(같은 시각 언어).
 * 앱 공통 셸(Header/TabBar)은 루트 layout이 제공하므로 여기선 콘텐츠만 렌더한다.
 *
 * 순수 프레젠테이션(상태·훅 없음)이라 서버(not-found)·클라이언트(error.tsx) 양쪽에서 쓸 수 있다.
 * 재시도(reset) 버튼처럼 클라 핸들러가 필요한 액션은 primary에 onClick으로 주입한다.
 */
export interface ErrorStateAction {
  label: string;
  /** 이동형 액션. onClick과 둘 중 하나만. */
  href?: string;
  /** 핸들러형 액션(재시도 등). href와 둘 중 하나만. */
  onClick?: () => void;
}

export function ErrorState({
  image,
  imageAlt,
  title,
  description,
  primary,
  secondary,
}: {
  image: StaticImageData;
  imageAlt: string;
  /** 제목(없으면 일러스트 카피가 대신 — 404처럼). */
  title?: string;
  description: string;
  primary: ErrorStateAction;
  secondary?: ErrorStateAction;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
      <Image src={image} alt={imageAlt} width={200} height={200} priority className="size-50" />

      {title && <p className="text-lg font-extrabold text-jg-ink">{title}</p>}

      <p className="-mt-2 text-[13px] leading-relaxed text-jg-ink-sub">{description}</p>

      <div className="mt-1 flex items-center gap-2">
        <ActionButton action={primary} variant="primary" />
        {secondary && <ActionButton action={secondary} variant="secondary" />}
      </div>
    </div>
  );
}

function ActionButton({
  action,
  variant,
}: {
  action: ErrorStateAction;
  variant: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-[16px] bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary/90"
      : "inline-flex items-center justify-center rounded-[16px] border border-border bg-card px-6 py-3.5 text-sm font-bold text-jg-ink-sub transition-colors hover:border-jg-ink-mute";

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}
