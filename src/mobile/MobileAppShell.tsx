import React, { useEffect, useMemo, useState } from 'react';
import { Group, Note } from '../types';
import MobileBottomNav, { MobileTab } from './MobileBottomNav';
import MobileNoteListScreen from './screens/MobileNoteListScreen';
import MobileNoteDetailScreen from './screens/MobileNoteDetailScreen';
import MobileFileListScreen, { ArchiveFile } from './screens/MobileFileListScreen';
import MobileFilePreviewScreen from './screens/MobileFilePreviewScreen';
import { useArchiveFiles } from '../archiveStore/features/archive/useArchiveFiles.js';
import { useArchiveMutations } from '../archiveStore/features/archive/useArchiveMutations.js';

type NoteView = 'LIST' | 'DETAIL';
type FileView = 'LIST' | 'PREVIEW';

// Non-terminal mutationStatus shapes produced by useArchiveMutations while an upload is running.
function isUploadInProgressStatus(status: string) {
  return status.endsWith('업로드 준비') || /\d+%$/.test(status);
}

interface MobileAppShellProps {
  notes: Note[];
  groups: Group[];
  selectedNote: Note | null;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  userId: string;
}

export default function MobileAppShell({
  notes,
  groups,
  selectedNote,
  onSelectNote,
  onAddNote,
  onEditNote,
  userId,
}: MobileAppShellProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('NOTES');
  const [noteView, setNoteView] = useState<NoteView>('LIST');
  const [fileView, setFileView] = useState<FileView>('LIST');
  const [selectedFile, setSelectedFile] = useState<ArchiveFile | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);

  const { files, setFiles, usedBytes, loading, firebaseReady } = useArchiveFiles(userId, 'firebase');
  const mutations = useArchiveMutations({
    dataBackend: 'firebase',
    firebaseReady,
    selectedFile: null,
    setFiles,
    setSelectedFile: () => undefined,
    setSelectedIds: () => undefined,
    usedBytes,
    userId,
  });

  useEffect(() => {
    if (!uploadingFile) return;
    const status: string = mutations.mutationStatus;
    if (!status) return;

    if (status === '업로드 완료') {
      setUploadingFile(null);
      setUploadFailed(false);
      return;
    }

    if (!isUploadInProgressStatus(status)) {
      setUploadFailed(true);
    }
  }, [mutations.mutationStatus, uploadingFile]);

  const uploadProgress = useMemo(() => {
    if (!uploadingFile) return 0;
    const match = (mutations.mutationStatus as string).match(/(\d+)%$/);
    return match ? Number(match[1]) : 0;
  }, [mutations.mutationStatus, uploadingFile]);

  const handleSelectNote = (id: string) => {
    onSelectNote(id);
    setNoteView('DETAIL');
  };

  const handleUploadFile = (file: File) => {
    setUploadingFile(file);
    setUploadFailed(false);
    mutations.handleFiles([file]);
  };

  const handleRetryUpload = () => {
    if (!uploadingFile) return;
    setUploadFailed(false);
    mutations.handleFiles([uploadingFile]);
  };

  const handleSelectFile = (file: ArchiveFile) => {
    setSelectedFile(file);
    setFileView('PREVIEW');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full bg-background">
      {activeTab === 'NOTES' &&
        (noteView === 'LIST' ? (
          <MobileNoteListScreen notes={notes} onSelectNote={handleSelectNote} onAddNote={onAddNote} />
        ) : (
          <MobileNoteDetailScreen
            note={selectedNote}
            groups={groups}
            onBack={() => setNoteView('LIST')}
            onEdit={() => selectedNote && onEditNote(selectedNote)}
          />
        ))}

      {activeTab === 'FILES' &&
        (fileView === 'LIST' || !selectedFile ? (
          <MobileFileListScreen
            files={files}
            loading={loading}
            onSelectFile={handleSelectFile}
            onUploadFile={handleUploadFile}
            uploadingFile={uploadingFile}
            uploadProgress={uploadProgress}
            uploadFailed={uploadFailed}
            onRetryUpload={handleRetryUpload}
          />
        ) : (
          <MobileFilePreviewScreen file={selectedFile} onBack={() => setFileView('LIST')} />
        ))}

      <MobileBottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}
