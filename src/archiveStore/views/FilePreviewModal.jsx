import { Download, X } from 'lucide-react';
import { formatBytes } from '../core/fileTypes.js';

async function downloadFile({ filename, url }) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('파일을 다운로드하지 못했습니다.');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function FilePreviewModal({ file, onClose }) {
  const handleDownload = async () => {
    if (!file.downloadUrl) return;

    try {
      await downloadFile({ filename: file.filename, url: file.downloadUrl });
    } catch (error) {
      alert(error instanceof Error ? error.message : '파일을 다운로드하지 못했습니다.');
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
          {file.downloadUrl && (
            <button
              type="button"
              className="download-link download-link-icon"
              title="다운로드"
              aria-label={`${file.filename} 다운로드`}
              onClick={handleDownload}
            >
              <Download size={18} aria-hidden="true" />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

