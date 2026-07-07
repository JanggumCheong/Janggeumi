# PNG to WebP 변환 기준

PNG 이미지를 WebP로 변환해 앱과 문서에서 더 가볍게 사용할 수 있게 한다.

## 기본 원칙

- 원본 PNG는 삭제하지 않는다.
- 같은 폴더 또는 지정된 출력 폴더에 WebP를 별도 생성한다.
- 투명 배경이 있는 PNG는 투명도를 유지한다.
- 변환 후 시각 품질과 파일 용량을 확인한다.
- 기존 파일을 덮어써야 하면 먼저 사용자에게 확인한다.

## 파일명 규칙

입력:

```text
example.png
```

출력:

```text
example.webp
```

여러 품질 버전을 만들 때:

```text
example-q80.webp
example-lossless.webp
```

## 권장 품질

- 일반 UI 이미지: quality 80~85
- 사진형 식자재 이미지: quality 82~88
- 투명 배경 캐릭터/아이콘: lossless 또는 quality 90
- 용량이 가장 중요한 썸네일: quality 75~80

## 변환 절차

1. 입력 PNG 경로를 확인한다.
2. 출력 WebP 경로를 정한다.
3. 투명 배경이 필요한 이미지인지 확인한다.
4. 품질 옵션을 선택한다.
5. 변환한다.
6. 변환 결과의 해상도, 용량, 시각 품질을 확인한다.

## 도구 선택

프로젝트에 이미 이미지 변환 도구가 있으면 그 도구를 우선 사용한다.

도구가 정해져 있지 않으면 다음 중 사용 가능한 것을 선택한다.

- `cwebp`
- ImageMagick `magick`
- Node.js `sharp`

## 명령 예시

`cwebp`:

```bash
cwebp -q 85 input.png -o input.webp
```

ImageMagick:

```bash
magick input.png -quality 85 input.webp
```

`sharp`를 사용할 때는 프로젝트 의존성에 이미 있는 경우에만 우선 사용한다. 새 의존성 설치가 필요하면 사용자에게 확인한다.

## 확인 기준

- WebP 파일이 정상 생성되었는가?
- 원본 PNG가 보존되었는가?
- 투명 배경이 깨지지 않았는가?
- 작은 화면에서 품질 저하가 눈에 띄지 않는가?
- 용량이 PNG보다 줄었는가?
