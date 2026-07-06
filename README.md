# personalMemo

React/Vite + TypeScript 기반 개인 메모 앱입니다. 초기 코드는 Google AI Studio에서 생성되었고, 이후 개발 주도권은 로컬 workspace와 Codex 관리 기준으로 이관합니다.

## 현재 범위
- 메모 목록, 상세, 작성/수정 화면
- 폴더/그룹 기반 분류
- 즐겨찾기, 휴지통, 검색, 캘린더 화면
- 프로필 이미지와 다크 모드 설정
- 브라우저 `localStorage` 기반 로컬 데이터 저장
- Gemini API 연동 준비 설정

## 실행 준비
필수 항목:
- Node.js
- npm

설치:

```powershell
npm install
```

환경 파일:

```powershell
Copy-Item .env.example .env.local
```

`.env.local`에 필요한 값을 설정합니다.

```text
GEMINI_API_KEY=<Gemini API Key>
APP_URL=http://localhost:3000
```

## 실행
```powershell
npm run dev
```

기본 개발 서버:

```text
http://localhost:3000
```

## 검증
```powershell
npm run build
npm run lint
```

## 개발 운영 기준
- 개발 기준 문서: `docs/codex_handover.md`
- project-control 상태 파일: `D:\Workspace\project_control\states\personalMemo_current.md`
- API 키와 개인 환경값은 `.env.local`에만 둡니다.
- `.env.local`, `node_modules`, `dist`, 로그 파일은 Git에 포함하지 않습니다.

## 원격 저장소
```text
https://github.com/mohenz/https-github.com-mohenz-personalMemo.git
```
