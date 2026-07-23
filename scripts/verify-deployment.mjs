import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hostingUrl = 'https://archive-store-fae71.web.app';
const expectedDataProject = 'archive-store-v2-3d020';
const forbiddenAuthDomain = 'archive-store-fae71.firebaseapp.com';
const stamp = Date.now();

const localHtml = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
const localBundlePath = localHtml.match(/assets\/index-[^"']+\.js/)?.[0];
if (!localBundlePath) throw new Error('로컬 배포 번들 경로를 찾지 못했습니다.');

const htmlResponse = await fetch(`${hostingUrl}/?v=${stamp}`);
if (!htmlResponse.ok) throw new Error(`운영 HTML 확인 실패: HTTP ${htmlResponse.status}`);
const remoteHtml = await htmlResponse.text();
const remoteBundlePath = remoteHtml.match(/assets\/index-[^"']+\.js/)?.[0];
if (remoteBundlePath !== localBundlePath) {
  throw new Error(`운영 번들 불일치: local=${localBundlePath}, remote=${remoteBundlePath || '없음'}`);
}

const bundleResponse = await fetch(`${hostingUrl}/${remoteBundlePath}?v=${stamp}`);
if (!bundleResponse.ok) throw new Error(`운영 번들 확인 실패: HTTP ${bundleResponse.status}`);
const remoteBundle = await bundleResponse.text();
if (!remoteBundle.includes(expectedDataProject)) {
  throw new Error(`운영 번들에 데이터 프로젝트 ${expectedDataProject}가 없습니다.`);
}
if (remoteBundle.includes(forbiddenAuthDomain)) {
  throw new Error('운영 번들에 잘못된 Hosting Auth 도메인이 포함됐습니다.');
}

console.log(`운영 배포 검증 통과: HTTP 200, bundle=${remoteBundlePath}, data=${expectedDataProject}`);
