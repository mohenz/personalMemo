import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowDirty = process.argv.includes('--allow-dirty');
const expectedHostingSite = 'archive-store-fae71';
const expectedDataProject = 'archive-store-v2-3d020';
const forbiddenAuthDomain = 'archive-store-fae71.firebaseapp.com';
const requiredFirebaseKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

config({ path: path.join(root, '.env.local'), quiet: true });

const missingKeys = requiredFirebaseKeys.filter((key) => !process.env[key]?.trim());
if (missingKeys.length > 0) {
  throw new Error(`.env.local 필수 Firebase 키 누락: ${missingKeys.join(', ')}`);
}
if (process.env.VITE_FIREBASE_PROJECT_ID !== expectedDataProject) {
  throw new Error(`데이터 프로젝트는 ${expectedDataProject}여야 합니다.`);
}
if (process.env.VITE_FIREBASE_AUTH_DOMAIN === forbiddenAuthDomain) {
  throw new Error('Hosting 프로젝트의 Auth 도메인이 데이터 프로젝트 설정에 사용됐습니다.');
}

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(root, 'firebase.json'), 'utf8'));
if (firebaseConfig.hosting?.site !== expectedHostingSite || firebaseConfig.hosting?.public !== 'dist') {
  throw new Error(`firebase.json은 site=${expectedHostingSite}, public=dist여야 합니다.`);
}

const indexHtml = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
const bundlePath = indexHtml.match(/assets\/index-[^"']+\.js/)?.[0];
if (!bundlePath) throw new Error('dist/index.html에서 JavaScript 번들을 찾지 못했습니다.');

const bundle = fs.readFileSync(path.join(root, 'dist', bundlePath), 'utf8');
if (!bundle.includes(expectedDataProject)) {
  throw new Error(`프로덕션 번들에 데이터 프로젝트 ${expectedDataProject}가 없습니다.`);
}
if (bundle.includes(forbiddenAuthDomain)) {
  throw new Error('프로덕션 번들에 잘못된 Hosting Auth 도메인이 포함됐습니다.');
}

if (!allowDirty) {
  const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  if (status.trim()) throw new Error('커밋되지 않은 변경사항이 있어 배포를 중단합니다.');

  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const upstream = execFileSync('git', ['rev-parse', 'origin/main'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  if (head !== upstream) throw new Error('HEAD와 origin/main이 일치하지 않아 배포를 중단합니다.');
}

console.log(`배포 사전검증 통과: site=${expectedHostingSite}, data=${expectedDataProject}, bundle=${bundlePath}`);
