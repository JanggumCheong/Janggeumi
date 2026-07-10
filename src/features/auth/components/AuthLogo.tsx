import { cn } from "@/lib/utils";
import logo from "../../../../assets/images/logo.webp";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

/** 장금이 브랜드 로고 로크업(캐릭터 + 워드마크). 로그인 히어로 브랜드 마크. */
export function AuthLogo({ className }: { className?: string }) {
  return (
    <ImageWithFallback
      src={logo}
      alt="장금이"
      priority
      className={cn("mx-auto h-auto w-64", className)}
    />
  );
}
