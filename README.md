# Mongmung CSS Lint Frontend

CSS Lint 서비스의 프론트엔드 애플리케이션입니다. Vue 3와 Vite를 사용하여 개발되었으며, CSS 코드를 검사하고 최적화하는 기능을 제공합니다.

## 프로젝트 소개

이 프로젝트는 CSS 코드에 대한 Lint 검사를 실행하고 코드 품질을 개선하는 웹 애플리케이션입니다. HTML과 CSS를 모두 지원하며, 심각한 오류를 찾고 코드 스타일을 통일하는 데 도움을 줍니다.

### 주요 기능

- CSS 및 HTML+CSS 코드 Lint 검사
- 코드 검사 결과 시각화
- 다양한 규칙(Rules) 설정 지원
- 코드 비교(Diff) 도구
- 다양한 출력 스타일 지원 (nested, compact)

## 기술 스택

- **프론트엔드**: Vue 3, Vite
- **에디터**: Monaco Editor
- **컨테이너화**: Docker, Nginx
- **스타일**: SASS/SCSS
- **기타 라이브러리**: axios, vue-router, vue-toast-notification

## 시작하기

### 요구사항

- Node.js 16 이상
- npm 8 이상 또는 Bun

### 설치

```bash
# npm으로 설치
npm install

# 또는 Bun으로 설치
bun install
```

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 결과 미리보기

```bash
npm run preview
```

### 코드 포맷팅

```bash
npm run format
```

## Docker 사용

### Docker 컨테이너 빌드 및 실행

```bash
docker-compose up --build
```

애플리케이션은 http://localhost:5001 에서 실행됩니다.

## 프로젝트 구조

```
mongmung-csslint-fe/
├── src/                  # 소스 코드
│   ├── assets/           # 정적 파일(이미지, CSS 등)
│   ├── components/       # Vue 컴포넌트
│   ├── router/           # Vue Router 설정
│   ├── utils/            # 유틸리티 함수
│   ├── views/            # 페이지 컴포넌트
│   ├── App.vue           # 루트 컴포넌트
│   └── main.js           # 애플리케이션 진입점
├── public/               # 정적 파일
├── dockerfile            # Docker 빌드 설정
├── nginx.conf            # Nginx 설정
├── docker-compose.yml    # Docker Compose 설정
├── vite.config.js        # Vite 설정
└── package.json          # 프로젝트 메타데이터 및 의존성
```

## 문제 해결

- 빌드 중 메모리 부족 오류가 발생하는 경우, `NODE_OPTIONS='--max-old-space-size=700'` 환경 변수를 설정하여 해결할 수 있습니다(package.json의 build 스크립트에 이미 설정되어 있음).
- Docker 컨테이너에서는 메모리 제한이 1GB로 설정되어 있습니다.

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 버전

현재 버전: 3.0.1
