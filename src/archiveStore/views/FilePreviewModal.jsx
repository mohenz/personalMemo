import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { formatBytes } from '../core/fileTypes.js';

function triggerBlobDownload(blob, filename) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }, 100);
}

// Firebase downloadUrl(?alt=media&token=...)은 공개 토큰 URL이므로 fetch() 가능
async function downloadFile(file) {
  const response = await fetch(file.downloadUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  triggerBlobDownload(blob, file.filename);
}

export function FilePreviewModal({ file, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async () => {
    if (!file.downloadUrl) return;
    setDownloadError('');
    setDownloading(true);
    try {
      await downloadFile(file);
    } catch {
      setDownloadError('다운로드에 실패했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p>{file.category}</p>
            <h2 id="preview-title">{file.filename}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="preview-body">
          {file.category === 'image' && file.downloadUrl ? (
            <img src={file.downloadUrl} alt="" />
          ) : (
            <div className="preview-placeholder">
              <strong>{file.mimeType || '파일'}</strong>
              <span>{formatBytes(file.size)}</span>
            </div>
          )}
        </div>

        <footer>
          <span>{formatBytes(file.size)}</span>
          {downloadError && <span className="download-error">{downloadError}</span>}
          {file.downloadUrl && (
            <button
              type="button"
              className="download-link download-link-icon"
              title={downloading ? '다운로드 중…' : '다운로드'}
              aria-label={`${file.filename} 다운로드`}
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={18} aria-hidden="true" />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

