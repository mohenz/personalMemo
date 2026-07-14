import { useEffect, useMemo, useState } from 'react';
import { isFirebaseConfigured } from '../../firebase/client.js';
import { fetchLocalFiles } from './localArchiveApi.js';
import { subscribeFiles } from './archiveService.js';
import { getEnv } from '../../core/env.js';

export function useArchiveFiles(userId) {
  const rawBackend = getEnv('VITE_DATA_BACKEND') || 'local-api';
  const dataBackend = String(rawBackend).trim().replace(/^\uFEFF/g, '');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(dataBackend === 'firebase' ? isFirebaseConfigured : true);

  useEffect(() => {
    if (dataBackend === 'local-api') {
      let isMounted = true;
      setLoading(true);
      fetchLocalFiles()
        .then((nextFiles) => {
          if (!isMounted) return;
          setFiles(nextFiles);
          setError(null);
        })
        .catch((nextError) => {
          if (!isMounted) return;
          setFiles([]);
          setError(nextError.message);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }

    if (!isFirebaseConfigured || !userId) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    return subscribeFiles(
      userId,
      (nextFiles) => {
        setFiles(nextFiles);
        setError(null);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      },
    );
  }, [dataBackend, userId]);

  const usedBytes = useMemo(() => files.reduce((total, file) => total + (file.size ?? 0), 0), [files]);

  return { files, setFiles, usedBytes, loading, error, firebaseReady: isFirebaseConfigured, dataBackend };
}
