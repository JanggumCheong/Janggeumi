import type { MetadataRoute } from "next";

// 브랜드 핵심색: 세이지 그린 (#5C6E3D)
const BRAND_SAGE = "#5C6E3D";
const BACKGROUND = "#FBF9F2";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "장금이",
    short_name: "장금이",
    description: "식재료 구매·보관·처리를 한눈에, 장금이",
    start_url: "/",
    display: "standalone",
    background_color: BACKGROUND,
    theme_color: BRAND_SAGE,
    lang: "ko",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
