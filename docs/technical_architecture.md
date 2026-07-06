# personalMemo Technical Architecture

## 1. 개요
`personalMemo`는 React/Vite + TypeScript 기반의 개인 메모 애플리케이션입니다. 현재 구현은 클라이언트 단독 실행 구조이며, 메모 데이터와 사용자 설정은 브라우저 `localStorage`에 저장합니다.

초기 코드는 Google AI Studio에서 생성되었고, 현재 개발 기준은 로컬 저장소 `D:\Workspace\personalMemo`와 project-control 상태 파일을 기준으로 관리합니다.

## 2. 기술 스택
- Runtime/UI: React 19
- Build tool: Vite 6
- Language: TypeScript
- Styling: Tailwind CSS 4
- Icons: lucide-react
- Animation dependency: motion
- AI dependency: `@google/genai`
- Local validation:
  - `npm run build`
  - `npm run lint`

## 3. 실행 구조
```text
index.html
  -> src/main.tsx
    -> src/App.tsx
      -> Sidebar
      -> SplashView
      -> NoteEditor
      -> SearchView
      -> CalendarView
      -> NoteDetail
      -> SettingsModal
```

개발 서버:

```powershell
npm run dev
```

기본 포트:

```text
http://localhost:3000
```

## 4. 핵심 기능

### 4.1 메모 관리
- 메모 생성
- 메모 수정
- 메모 삭제
  - 일반 메모는 휴지통으로 이동합니다.
  - 휴지통 메모를 다시 삭제하면 영구 삭제합니다.
- 메모 상세 조회
- 메모 즐겨찾기 토글
- 메모 그룹 지정

### 4.2 분류 / 탐색
- 전체 메모 보기
- 중요 메모 보기
- 휴지통 보기
- 그룹 폴더별 필터링
- 새 그룹 폴더 생성
- 대시보드 상단 검색
- 상세 검색 화면
- 캘린더 화면에서 날짜 기준 메모 탐색

### 4.3 작성 도구
- 제목 입력
- 본문 입력
- 그룹 선택
- 체크리스트 추가/삭제
- 체크리스트 완료 토글
- 샘플 이미지 첨부
- 사용자 입력 이미지 URL 첨부
- 이미지 첨부 제거

### 4.4 설정 / 기타
- 프로필 이미지 설정
- 다크 모드 토글
- PWA 설치 프롬프트 처리
- 공유 링크 클립보드 복사 시뮬레이션
- 서식/그리기/음성 도구는 현재 데모성 알림 수준입니다.

## 5. 데이터 모델

### 5.1 Group
```ts
interface Group {
  id: string;
  name: string;
  icon?: string;
}
```

용도:
- 메모를 업무/개인/여행 등으로 분류합니다.
- `icon`은 lucide 아이콘 이름 문자열로 관리합니다.

### 5.2 ChecklistItem
```ts
interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}
```

용도:
- 메모 안의 할 일 목록을 표현합니다.

### 5.3 Note
```ts
interface Note {
  id: string;
  title: string;
  content: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
  dateString: string;
  isFavorite: boolean;
  isDeleted: boolean;
  images: string[];
  checklist: ChecklistItem[];
}
```

용도:
- 앱의 핵심 메모 엔티티입니다.
- `isDeleted`를 통해 휴지통 상태를 표현합니다.
- `images`는 현재 URL 문자열 배열입니다.
- `dateString`은 캘린더 화면에서 날짜 매핑에 사용합니다.

### 5.4 ScreenType
```ts
type ScreenType = 'SPLASH' | 'DASHBOARD' | 'EDITOR' | 'SEARCH' | 'CALENDAR';
```

용도:
- `App.tsx`에서 현재 화면을 분기하는 단순 라우터 역할을 합니다.

## 6. 저장소 구조

현재 백엔드 서버나 DB는 없습니다. 모든 데이터는 브라우저 `localStorage`에 저장됩니다.

| Key | Value |
|---|---|
| `personal_notes_data` | `Note[]` JSON |
| `personal_notes_folders` | `Group[]` JSON |
| `personal_notes_profile_img` | 프로필 이미지 URL |
| `personal_notes_dark_mode` | 다크 모드 boolean 문자열 |

초기값:
- `src/data.ts`의 `DEFAULT_NOTES`
- `src/data.ts`의 `DEFAULT_GROUPS`
- `src/data.ts`의 `PREMIUM_IMAGES`

## 7. 상태 관리

상태 관리는 React `useState`, 파생 데이터는 `useMemo`, 저장 동기화는 `useEffect`로 처리합니다.

주요 상태:
- `screen`: 현재 화면
- `notes`: 메모 목록
- `groups`: 폴더 목록
- `activeGroupId`: 현재 필터 그룹
- `selectedNoteId`: 현재 선택된 메모
- `editingNote`: 편집 중인 메모
- `dashboardSearchQuery`: 대시보드 검색어
- `dashboardSortDesc`: 정렬 방향
- `profileImage`: 프로필 이미지
- `darkMode`: 다크 모드
- `showSettingsModal`: 설정 모달 표시 여부

## 8. 컴포넌트 책임

### App.tsx
- 앱 전역 상태 소유
- 화면 전환
- 메모 CRUD 처리
- localStorage 읽기/쓰기
- 필터링, 검색, 정렬
- 선택 메모 계산

### Sidebar.tsx
- 좌측 메뉴
- 전체/중요/검색/캘린더/휴지통 이동
- 그룹 폴더 목록 표시
- 새 폴더 생성 모달
- 설정 진입

### NoteEditor.tsx
- 메모 생성/수정 폼
- 제목/본문/그룹 선택
- 체크리스트 편집
- 이미지 첨부/삭제
- 저장 시 `Partial<Note>`를 상위로 전달

### NoteDetail.tsx
- 선택 메모 상세 표시
- 즐겨찾기 토글
- 삭제 요청
- 체크리스트 완료 토글
- 이미지 표시
- 공유/서식/그리기/음성 도구 UI

### SearchView.tsx
- 전체 메모 검색 화면
- 검색 결과에서 메모 선택
- 새 메모 작성 진입

### CalendarView.tsx
- `dateString` 기준 메모 탐색
- 특정 날짜에 새 메모 작성 진입

### SettingsModal.tsx
- 프로필 이미지 변경
- 다크 모드 변경
- PWA 설치 프롬프트 실행

### SplashView.tsx
- 초기 진입 화면
- 완료 후 대시보드로 전환

## 9. 데이터 흐름

### 9.1 앱 시작
1. `App.tsx`가 localStorage에서 메모/폴더/설정을 읽습니다.
2. 값이 없거나 파싱 실패 시 `src/data.ts`의 기본값을 사용합니다.
3. 초기 화면은 `SPLASH`입니다.
4. Splash 완료 후 `DASHBOARD`로 전환합니다.

### 9.2 메모 생성
1. 사용자가 추가 버튼을 누릅니다.
2. `screen`이 `EDITOR`로 변경됩니다.
3. `NoteEditor`에서 제목/본문/그룹/체크리스트/이미지를 입력합니다.
4. 저장 시 `App.tsx`의 `handleSaveNote`가 새 `Note`를 생성합니다.
5. `notes`가 갱신되고 localStorage에 저장됩니다.

### 9.3 메모 수정
1. 상세 화면에서 수정 버튼을 누릅니다.
2. `editingNote`에 현재 메모를 설정하고 `EDITOR`로 전환합니다.
3. 저장 시 기존 메모를 덮어씁니다.
4. `notes`가 갱신되고 localStorage에 저장됩니다.

### 9.4 삭제
1. 삭제 요청 시 현재 메모가 일반 상태이면 `isDeleted: true`로 변경합니다.
2. 이미 휴지통 상태이면 배열에서 제거합니다.
3. 남은 메모 중 하나를 선택합니다.

## 10. 환경 변수

`.env.example` 기준:

```text
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```

현재 기본 메모 UI는 API 키 없이 동작해야 합니다. Gemini 관련 기능은 API 키 설정 후 별도 검증이 필요합니다.

주의:
- `.env.local`은 Git에 포함하지 않습니다.
- API 키는 코드와 문서에 직접 기록하지 않습니다.

## 11. 검증 상태

확인 완료:
- `npm install`
- `npm run build`
- `npm run lint`

원격:
- repository: `https://github.com/mohenz/personalMemo.git`
- branch: `main`
- latest known commit: `622f2b5 Document Codex development handover`

## 12. 현재 한계 / 리스크
- 데이터가 localStorage에만 저장되어 브라우저/기기 간 동기화가 없습니다.
- localStorage 삭제 시 메모 데이터가 사라질 수 있습니다.
- 이미지 첨부는 실제 업로드가 아니라 URL 참조 방식입니다.
- 샘플 이미지는 외부 `lh3.googleusercontent.com` URL에 의존합니다.
- `package.json`의 프로젝트명이 아직 `react-example`입니다.
- `clean` 스크립트가 `rm -rf`를 사용해 Windows PowerShell에서 호환 문제가 있을 수 있습니다.
- Gemini API 의존성은 있으나 실제 AI 기능은 아직 명확히 연결/검증되지 않았습니다.

## 13. 권장 개선 방향
1. 프로젝트 메타 정리
   - `package.json` name을 `personal-memo` 등으로 변경
   - Windows 호환 `clean` 스크립트로 수정
2. 저장소 계층 분리
   - localStorage 접근을 별도 storage service로 분리
   - 추후 Firebase/Supabase/로컬 파일 저장소로 교체 가능하게 설계
3. 메모 영속화 개선
   - 내보내기/가져오기
   - 백업 파일 생성
   - 클라우드 동기화 후보 검토
4. 이미지 처리 개선
   - 실제 파일 업로드
   - 로컬/클라우드 스토리지 연동
   - 외부 샘플 이미지 로컬 에셋화
5. AI 기능 정의
   - Gemini로 요약, 태그 추천, 제목 추천, 검색 보조 중 무엇을 제공할지 확정
6. 테스트 추가
   - 상태 업데이트 로직 단위 테스트
   - 메모 작성/수정/삭제 e2e 테스트
