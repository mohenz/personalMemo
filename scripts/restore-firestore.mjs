/**
 * Firestore 복구 스크립트
 *
 * 사용:
 *   node scripts/restore-firestore.mjs                          # 최신 백업 파일 자동 선택
 *   node scripts/restore-firestore.mjs backups/파일명.json      # 특정 백업 파일 지정
 *
 * 주의: 기존 Firestore 데이터를 백업 시점으로 덮어씁니다.
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serviceAccountPath = path.join(root, 'service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌  service-account.json 이 없습니다. backup-firestore.mjs 의 준비 방법을 참고하세요.');
  process.exit(1);
}

// 백업 파일 결정
const backupDir = path.join(root, 'backups');
let backupFile = process.argv[2];

if (!backupFile) {
  // 가장 최신 백업 자동 선택
  const files = fs.readdirSync(backupDir)
    .filter((f) => f.startsWith('personalMemo-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌  backups/ 에 백업 파일이 없습니다.');
    process.exit(1);
  }

  backupFile = path.join(backupDir, files[0]);
  console.log(`백업 파일 목록 (최신순):`);
  files.slice(0, 5).forEach((f, i) => console.log(`  ${i === 0 ? '→' : ' '} ${f}`));
  console.log();
}

const absPath = path.isAbsolute(backupFile) ? backupFile : path.join(root, backupFile);
if (!fs.existsSync(absPath)) {
  console.error(`❌  파일을 찾을 수 없습니다: ${absPath}`);
  process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(absPath, 'utf8'));
const meta = backup._meta || {};
const uids = Object.keys(backup).filter((k) => k !== '_meta');

console.log(`복구 대상 파일: ${path.basename(absPath)}`);
console.log(`  백업 시각: ${meta.createdAt || '알 수 없음'}`);
console.log(`  git 커밋:  ${meta.gitHash || '알 수 없음'}`);
console.log(`  사용자 수: ${uids.length}`);
uids.forEach((uid) => {
  const d = backup[uid];
  const noteCount = Array.isArray(d.notes) ? d.notes.length : 0;
  const scheduleCount = Array.isArray(d.schedules) ? d.schedules.length : 0;
  console.log(`    uid=${uid.slice(0, 8)}…  메모 ${noteCount}개  일정 ${scheduleCount}개`);
});

// 확인 프롬프트
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
await new Promise((resolve) => {
  rl.question('\n⚠️  현재 Firestore 데이터를 위 내용으로 덮어씁니다. 계속하려면 "복구" 를 입력하세요: ', (answer) => {
    rl.close();
    if (answer.trim() !== '복구') {
      console.log('취소되었습니다.');
      process.exit(0);
    }
    resolve();
  });
});

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

for (const uid of uids) {
  const docRef = db.doc(`users/${uid}/apps/personalMemo`);
  await docRef.set(backup[uid]);
  console.log(`  ✅  uid=${uid.slice(0, 8)}… 복구 완료`);
}

console.log('\n✅  복구 완료');
