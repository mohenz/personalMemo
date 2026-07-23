# MEMOry 배포 운영 절차

## 글로벌 기준

- 공통 절차와 실패 대응: `project_control/project_docs/DEPLOYMENT_PREVENTION_STANDARD.md`
- 이 문서는 MEMOry의 프로젝트 고유 명령과 불변조건만 정의한다.

## 프로젝트 명령

배포 전 통합 검사:

```powershell
npm.cmd run deploy:check
```

검사, Hosting 배포, 운영 확인:

```powershell
npm.cmd run deploy:hosting
```

## 프로젝트 불변조건

- Hosting: `archive-store-fae71`
- Auth/Firestore/Storage 데이터: `archive-store-v2-3d020`
- 배포 디렉터리: `dist`
- 배포 대상: Hosting만
- Firebase CLI: `firebase-tools@15.24.0`
- Jest 구성: `config/jest.config.cjs`
