# MEMOry Manual User Account Operations

## 운영 원칙

MEMOry는 가족 또는 소규모 사용자 5인 이내가 각자 독립 계정으로 사용하는 개인 디지털 메모장이다.
앱 내부에는 회원가입 기능을 만들지 않는다.

사용자 계정은 운영자가 Firebase Console에서 직접 생성한다.
각 사용자는 발급받은 이메일/비밀번호로 로그인하며, 데이터는 Firebase Auth `uid` 기준으로 자동 분리된다.

## 하지 않는 기능

- 앱 내부 계정 만들기
- 가족 공간
- 메모/일정 공유
- 자료실 공유
- 사용자 초대
- 공동 편집
- 앱 내 관리자 권한 모델

## 사용자 생성 절차

1. Firebase Console에 접속한다.
2. 프로젝트 `archive-store-v2-3d020`을 선택한다.
3. `Authentication` 메뉴로 이동한다.
4. `Users` 탭에서 `사용자 추가`를 선택한다.
5. 사용자 이메일과 임시 비밀번호를 입력한다.
6. 생성된 계정 정보를 사용자에게 전달한다.
7. 사용자는 `https://archive-store-fae71.web.app`에서 로그인한다.

## 사용자 수 제한

사용자는 운영상 5인 이내로 관리한다.
앱 코드나 별도 서버 권한으로 5인 제한을 강제하지 않는다.

5인 제한은 Firebase Console의 `Authentication > Users` 목록에서 운영자가 직접 확인한다.

## 데이터 분리 구조

각 사용자의 데이터는 Firebase Auth `uid` 기준으로 분리된다.

```text
메모 데이터:
users/{uid}/apps/personalMemo

자료실 파일 목록:
users/{uid}/files/{fileId}

자료실 실제 파일:
users/{uid}/files/{fileId}_{filename}

메모 첨부 이미지:
users/{uid}/personalMemo/images/*

프로필 이미지:
users/{uid}/personalMemo/profile/*
```

예를 들어 A 사용자와 B 사용자가 각각 로그인하면 다음처럼 분리된다.

```text
A 사용자:
users/A_UID/apps/personalMemo
users/A_UID/files/*

B 사용자:
users/B_UID/apps/personalMemo
users/B_UID/files/*
```

## 보안 규칙 원칙

Firestore와 Storage는 현재 로그인한 사용자만 자신의 `uid` 경로에 접근하도록 제한한다.

Firestore 원칙:

```text
request.auth != null && request.auth.uid == uid
```

Storage 원칙:

```text
request.auth != null && request.auth.uid == uid
```

앱 화면에서 사용자를 숨기는 것만으로는 충분하지 않다.
데이터베이스와 스토리지 규칙에서 반드시 `uid` 기준 접근 제한을 유지한다.

## 계정 전달 권장 방식

계정 정보를 전달할 때는 다음 내용을 함께 안내한다.

- 접속 URL: `https://archive-store-fae71.web.app`
- 로그인 이메일
- 임시 비밀번호
- 비밀번호 재설정 기능 사용 가능 여부
- 각 계정 데이터는 다른 사용자와 공유되지 않는다는 점

## 검증 항목

새 사용자를 추가한 뒤 다음을 확인한다.

- 새 사용자가 로그인할 수 있는지 확인
- 첫 로그인 시 빈 메모장과 빈 자료실로 시작하는지 확인
- 메모 작성 후 재접속해도 유지되는지 확인
- 자료실 파일 업로드가 가능한지 확인
- 다른 사용자 계정에서 해당 메모와 파일이 보이지 않는지 확인
- 로그아웃 후 이전 사용자 데이터가 화면에 남지 않는지 확인

## 배포 주의사항

Hosting 프로젝트와 실제 데이터 프로젝트는 다르다.

```text
Hosting:
archive-store-fae71

Auth/Firestore/Storage:
archive-store-v2-3d020
```

배포 전후로 프로덕션 번들이 반드시 `archive-store-v2-3d020`을 바라보는지 확인한다.
`archive-store-fae71.firebaseapp.com`이 번들에 포함되면 기존 데이터가 사라진 것처럼 보일 수 있으므로 배포를 중단한다.
