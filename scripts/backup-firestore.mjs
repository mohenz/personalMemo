/**
 * Firestore 백업 스크립트 (REST API 방식 — 서비스 계정 불필요)
 *
 * 준비: .env.local 에 아래 두 줄 추가
 *   FIREBASE_BACKUP_EMAIL=your@email.com
 *   FIREBASE_BACKUP_PASSWORD=yourpassword
 *
 * 사용:
 *   npm run backup
 *
 * 출력:
 *   backups/personalMemo-YYYY-MM-DDTHH-MM-SS-{gitHash}.json
 */

import { config } from 'dotenv';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
config({ path: path.join(root, '.env.local') });

const API_KEY = process.env.VITE_FIREBASE_API_KEY;
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;
const EMAIL = process.env.FIREBASE_BACKUP_EMAIL?.trim();
const PASSWORD = process.env.FIREBASE_BACKUP_PASSWORD?.trim();

if (!EMAIL || !PASSWORD) {
  console.warn('⚠️  백업 건너뜀: .env.local 에 FIREBASE_BACKUP_EMAIL / FIREBASE_BACKUP_PASSWORD 를 추가하세요.');
  process.exit(0);
}

// 1. 이메일/비밀번호로 Firebase Auth 로그인 → ID 토큰 발급
const signInRes = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
  },
);

if (!signInRes.ok) {
  const body = await signInRes.text();
  console.warn(`⚠️  백업 건너뜀: Firebase 로그인 실패 (${signInRes.status})`);
  console.warn('   원인:', body);
  process.exit(0);
}

const { idToken, localId: uid } = await signInRes.json();

// 2. Firestore REST API 로 문서 읽기
const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}/apps/personalMemo`;
const docRes = await fetch(docUrl, { headers: { Authorization: `Bearer ${idToken}` } });

if (!docRes.ok) {
  console.warn(`⚠️  백업 건너뜀: Firestore 읽기 실패 (${docRes.status})`);
  process.exit(0);
}

const firestoreDoc = await docRes.json();

// 3. Firestore REST 포맷 → 일반 JSON 변환
function fromValue(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(fromValue);
  if ('mapValue' in v) return fromFields(v.mapValue.fields ?? {});
  return null;
}

function fromFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fromValue(v)]));
}

const data = fromFields(firestoreDoc.fields ?? {});

// 4. 백업 파일 저장
let gitHash = 'unknown';
try {
  gitHash = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
} catch { /* git 없으면 그냥 진행 */ }

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupDir = path.join(root, 'backups');
fs.mkdirSync(backupDir, { recursive: true });

const noteCount = Array.isArray(data.notes) ? data.notes.length : 0;
const scheduleCount = Array.isArray(data.schedules) ? data.schedules.length : 0;
console.log(`  uid=${uid.slice(0, 8)}…  메모 ${noteCount}개  일정 ${scheduleCount}개`);

const backup = {
  _meta: { createdAt: new Date().toISOString(), gitHash, project: PROJECT_ID, uid },
  [uid]: data,
};

const filename = path.join(backupDir, `personalMemo-${timestamp}-${gitHash}.json`);
fs.writeFileSync(filename, JSON.stringify(backup, null, 2), 'utf8');

console.log(`\n✅  백업 완료: backups/${path.basename(filename)}`);
console.log(`   메모 ${noteCount}개  일정 ${scheduleCount}개`);
