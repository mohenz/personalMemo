/**
 * Firestore 백업 스크립트
 *
 * 실행 전 준비:
 *   Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성
 *   → 다운로드한 JSON을 프로젝트 루트에 service-account.json 으로 저장
 *
 * 사용:
 *   node scripts/backup-firestore.mjs
 *
 * 출력:
 *   backups/personalMemo-YYYY-MM-DDTHH-MM-SS-{gitHash}.json
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serviceAccountPath = path.join(root, 'service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error([
    '❌  service-account.json 이 없습니다.',
    '',
    '준비 방법:',
    '  1. https://console.firebase.google.com/project/archive-store-v2-3d020/settings/serviceaccounts/adminsdk',
    '  2. "새 비공개 키 생성" 클릭 → JSON 다운로드',
    '  3. 파일명을 service-account.json 으로 바꿔 프로젝트 루트에 저장',
  ].join('\n'));
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

let gitHash = 'unknown';
try {
  gitHash = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
} catch {
  // git 없으면 그냥 진행
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupDir = path.join(root, 'backups');
fs.mkdirSync(backupDir, { recursive: true });

const usersSnapshot = await db.collection('users').get();

const backup = {
  _meta: {
    createdAt: new Date().toISOString(),
    gitHash,
    project: serviceAccount.project_id,
    userCount: 0,
  },
};

for (const userDoc of usersSnapshot.docs) {
  const uid = userDoc.id;
  const memoSnap = await db.doc(`users/${uid}/apps/personalMemo`).get();
  if (!memoSnap.exists) continue;

  const data = memoSnap.data();
  backup[uid] = data;
  backup._meta.userCount += 1;

  const noteCount = Array.isArray(data.notes) ? data.notes.length : 0;
  const scheduleCount = Array.isArray(data.schedules) ? data.schedules.length : 0;
  console.log(`  uid=${uid.slice(0, 8)}…  메모 ${noteCount}개  일정 ${scheduleCount}개`);
}

const filename = path.join(backupDir, `personalMemo-${timestamp}-${gitHash}.json`);
fs.writeFileSync(filename, JSON.stringify(backup, null, 2), 'utf8');

console.log(`\n✅  백업 완료: backups/${path.basename(filename)}`);
console.log(`   사용자 수: ${backup._meta.userCount}`);
