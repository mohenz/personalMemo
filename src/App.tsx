/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Settings, 
  SlidersHorizontal,
  FileText,
  Image as ImageIcon,
  Cloud,
  Lock,
  LogIn
} from 'lucide-react';
import { Note, Group, ScreenType } from './types';
import { PREMIUM_IMAGES } from './data';
import SplashView from './components/SplashView';
import Sidebar from './components/Sidebar';
import NoteDetail from './components/NoteDetail';
import NoteEditor from './components/NoteEditor';
import SearchView from './components/SearchView';
import CalendarView from './components/CalendarView';
import SettingsModal from './components/SettingsModal';
import { ArchiveView } from './archiveStore/views/ArchiveView.jsx';
import './archiveStore/styles.css';
import {
  loadMemoCloudState,
  loginArchiveAccount,
  logoutArchiveAccount,
  resetArchivePassword,
  saveMemoCloudState,
  subscribeArchiveAccount,
  uploadMemoImage,
  uploadMemoProfileImage,
} from './services/archiveIntegration';
import { isFirebaseConfigured } from './firebase/client';
import { resolveNoteTitle } from './utils/autoTitle';
import { toLocalDateString } from './utils/date';

const LEGACY_SAMPLE_NOTE_IDS = new Set([
  'note-1',
  'note-2',
  'note-3',
  'note-4',
  'note-5',
  'note-6',
  'note-7',
  'note-8',
  'note-9',
  'note-10',
]);

const LEGACY_SAMPLE_GROUP_IDS = new Set(['work', 'personal', 'travel']);

export default function App() {
  // --- Screen State Control ---
  const [screen, setScreen] = useState<ScreenType>('SPLASH');

  // --- Settings & Theme States ---
  const [profileImage, setProfileImage] = useState<string>(PREMIUM_IMAGES.userProfile);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [archiveUser, setArchiveUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [archiveStatus, setArchiveStatus] = useState('');
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [loginEmail, setLoginEmail] = useState(() => localStorage.getItem('archive_store_remembered_email') || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const saveTimerRef = useRef<number | null>(null);

  // Capture PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  // --- Core State: Firebase is the source of truth after login ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // --- Navigation & Filter Controls ---
  const [activeGroupId, setActiveGroupId] = useState<string>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string>('note-1');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');
  const [dashboardSortDesc, setDashboardSortDesc] = useState(true);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);
  const draftNoteIdRef = useRef<string | null>(null);

  useEffect(() => {
    return subscribeArchiveAccount(async (user) => {
      setArchiveUser(user ? { uid: user.uid, email: user.email } : null);
      setCloudReady(false);
      setAuthLoading(true);

      if (!user) {
        setAuthLoading(false);
        return;
      }

      try {
        const cloudState = await loadMemoCloudState(user.uid);
        const nextNotes = Array.isArray(cloudState?.notes)
          ? cloudState.notes.filter((note) => !LEGACY_SAMPLE_NOTE_IDS.has(note.id))
          : [];
        const nextGroups = Array.isArray(cloudState?.groups)
          ? cloudState.groups.filter((group) => !LEGACY_SAMPLE_GROUP_IDS.has(group.id))
          : [];
        setNotes(nextNotes);
        setGroups(nextGroups);
        setProfileImage(typeof cloudState?.profileImage === 'string' ? cloudState.profileImage : PREMIUM_IMAGES.userProfile);
        setDarkMode(typeof cloudState?.darkMode === 'boolean' ? cloudState.darkMode : false);
        setArchiveStatus('자료실 계정과 동기화되었습니다.');
      } catch (error) {
        setArchiveStatus(error instanceof Error ? error.message : '자료실 동기화에 실패했습니다.');
      } finally {
        setCloudReady(true);
        setAuthLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!archiveUser || !cloudReady) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

    saveTimerRef.current = window.setTimeout(() => {
      saveMemoCloudState(archiveUser.uid, { darkMode, groups, notes, profileImage })
        .then(() => setArchiveStatus('자료실 백엔드에 저장되었습니다.'))
        .catch((error) => setArchiveStatus(error instanceof Error ? error.message : '자료실 저장에 실패했습니다.'));
    }, 500);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [archiveUser, cloudReady, darkMode, groups, notes, profileImage]);

  // --- Computed Note Filters for Middle Pane ---
  const filteredDashboardNotes = useMemo(() => {
    return notes
      .filter(note => {
        // Starred folder
        if (activeGroupId === 'starred') {
          return note.isFavorite && !note.isDeleted;
        }
        // Trash folder
        if (activeGroupId === 'trash') {
          return note.isDeleted;
        }
        // Specific group folder
        if (activeGroupId !== 'all') {
          return note.groupId === activeGroupId && !note.isDeleted;
        }
        // Default: Active notes in 'all' view
        return !note.isDeleted;
      })
      .filter(note => {
        // Quick search from dashboard top-bar
        if (!dashboardSearchQuery.trim()) return true;
        const q = dashboardSearchQuery.toLowerCase();
        return (
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.dateString).getTime() || 0;
        const timeB = new Date(b.dateString).getTime() || 0;
        return dashboardSortDesc ? timeB - timeA : timeA - timeB;
      });
  }, [notes, activeGroupId, dashboardSearchQuery, dashboardSortDesc]);

  // Active note detail binding
  const selectedNote = useMemo(() => {
    const found = notes.find(n => n.id === selectedNoteId);
    if (found) return found;
    // Fallback to first filtered note
    return filteredDashboardNotes[0] || null;
  }, [notes, selectedNoteId, filteredDashboardNotes]);

  // --- State Action Handlers ---
  const handleAddFolder = (name: string) => {
    const newGroup: Group = {
      id: 'group-' + Date.now(),
      name: name,
      icon: 'Folder'
    };
    setGroups([...groups, newGroup]);
    setActiveGroupId(newGroup.id);
  };

  const handleToggleFavorite = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  const handleToggleChecklistItem = (noteId: string, itemId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          checklist: note.checklist.map(item => 
            item.id === itemId ? { ...item, done: !item.done } : item
          )
        };
      }
      return note;
    }));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        if (note.isDeleted) {
          // If already in trash, perm-delete it
          return null;
        } else {
          // Soft delete
          return { ...note, isDeleted: true };
        }
      }
      return note;
    }).filter((n): n is Note => n !== null));
    
    // Select another note after deletion
    const remaining = filteredDashboardNotes.filter(n => n.id !== noteId);
    if (remaining.length > 0) {
      setSelectedNoteId(remaining[0].id);
    }
  };

  const handleStartAddNote = (withDate?: string) => {
    draftNoteIdRef.current = null;
    setEditingNote(null);
    setPrefilledDate(withDate || null);
    setScreen('EDITOR');
  };

  const handleStartEditNote = (note: Note) => {
    draftNoteIdRef.current = null;
    setEditingNote(note);
    setScreen('EDITOR');
  };

  const handleAutoSaveNote = (editedFields: Partial<Note>) => {
    if (editingNote) {
      setNotes(prev => prev.map(note =>
        note.id === editingNote.id ? { ...note, ...editedFields } as Note : note
      ));
      return;
    }

    const draftNoteId = draftNoteIdRef.current;
    if (draftNoteId) {
      setNotes(prev => prev.map(note =>
        note.id === draftNoteId ? { ...note, ...editedFields } as Note : note
      ));
      return;
    }

    const dateStr = prefilledDate || toLocalDateString();
    const newNote: Note = {
      id: 'note-' + Date.now(),
      title: editedFields.title || '제목 없는 메모',
      content: editedFields.content || '',
      groupId: editedFields.groupId || 'personal',
      createdAt: editedFields.updatedAt || '',
      updatedAt: editedFields.updatedAt || '',
      dateString: dateStr,
      isFavorite: false,
      isDeleted: false,
      images: editedFields.images || [],
      checklist: editedFields.checklist || []
    };

    draftNoteIdRef.current = newNote.id;
    setEditingNote(newNote);
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };

  const handleSaveNote = (editedFields: Partial<Note>) => {
    const savedGroupId = editedFields.groupId || editingNote?.groupId || 'personal';
    const savedFields = {
      ...editedFields,
      groupId: savedGroupId,
      title: resolveNoteTitle({
        groupId: savedGroupId,
        groups,
        title: editedFields.title,
      }),
    };

    if (editingNote) {
      // Editing Mode
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id ? { ...note, ...savedFields } as Note : note
      ));
      setSelectedNoteId(editingNote.id);
    } else {
      // Creating Mode
      const dateStr = prefilledDate || toLocalDateString(); // Pre-filled or current local date
      const newNote: Note = {
        id: 'note-' + Date.now(),
        title: savedFields.title || '제목 없는 메모',
        content: savedFields.content || '',
        groupId: savedFields.groupId || 'personal',
        createdAt: savedFields.updatedAt || '',
        updatedAt: savedFields.updatedAt || '',
        dateString: dateStr,
        isFavorite: false,
        isDeleted: false,
        images: savedFields.images || [],
        checklist: savedFields.checklist || []
      };
      setNotes(prev => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
    }
    draftNoteIdRef.current = null;
    setPrefilledDate(null);
    setScreen('DASHBOARD');
  };

  // Switch to Search screen and automatically inject search keywords
  const handleLaunchSearch = () => {
    setScreen('SEARCH');
  };

  // Splash complete
  const handleSplashComplete = () => {
    setScreen('DASHBOARD');
  };

  const handleUnifiedLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginStatus(resetMode ? '비밀번호 재설정 메일을 보내는 중입니다.' : '통합 계정에 로그인하는 중입니다.');

    try {
      if (resetMode) {
        await resetArchivePassword(loginEmail);
        setLoginStatus('비밀번호 재설정 메일을 보냈습니다.');
        setResetMode(false);
        return;
      }

      await loginArchiveAccount(loginEmail, loginPassword);
      localStorage.setItem('archive_store_remember_email', 'true');
      localStorage.setItem('archive_store_remembered_email', loginEmail.trim());
      setLoginPassword('');
      setLoginStatus('');
    } catch (error) {
      setLoginStatus(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  };

  const renderUnifiedAuth = () => (
    <main className="relative w-full h-screen bg-background text-on-surface flex items-center justify-center overflow-hidden px-4">
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#0058be 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px'
        }}
      />
      <section className="relative z-10 w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-soft p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-soft">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-on-background">MEMOry</h1>
            <p className="text-xs font-semibold text-on-surface-variant mt-1">메모장과 자료실 통합 계정</p>
          </div>
        </div>

        {authLoading ? (
          <div className="h-48 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <div className="w-9 h-9 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm font-semibold">계정 상태를 확인하는 중입니다.</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleUnifiedLogin}>
            {!isFirebaseConfigured && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-700">
                Firebase 환경변수가 설정되지 않아 통합 로그인을 사용할 수 없습니다.
              </div>
            )}
            <label className="block text-xs font-bold text-on-surface-variant">
              이메일
              <input
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-lg border border-outline-variant bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                type="email"
                autoComplete="email"
              />
            </label>
            {!resetMode && (
              <label className="block text-xs font-bold text-on-surface-variant">
                비밀번호
                <input
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  className="mt-1 w-full h-11 px-3 rounded-lg border border-outline-variant bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  type="password"
                  autoComplete="current-password"
                />
              </label>
            )}
            {loginStatus && <p className="text-xs font-semibold text-primary">{loginStatus}</p>}
            <button
              type="submit"
              disabled={!isFirebaseConfigured || !loginEmail.trim() || (!resetMode && !loginPassword)}
              className="w-full h-11 rounded-lg bg-primary text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {resetMode ? <Lock className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{resetMode ? '재설정 메일 보내기' : '통합 계정으로 시작'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setResetMode((value) => !value);
                setLoginStatus('');
              }}
              className="w-full h-10 rounded-lg text-primary font-bold hover:bg-primary/5"
            >
              {resetMode ? '로그인으로 돌아가기' : '비밀번호 재설정'}
            </button>
          </form>
        )}
      </section>
    </main>
  );

  // --- Render Router ---
  return (
    <div className={`flex w-full h-screen bg-background text-on-surface font-sans overflow-hidden ${darkMode ? 'dark' : ''}`}>
      
      {/* 1. Splash Screen Mode */}
      {screen === 'SPLASH' && (
        <SplashView onComplete={handleSplashComplete} />
      )}

      {screen !== 'SPLASH' && (!archiveUser || authLoading) && renderUnifiedAuth()}

      {/* Main app layouts */}
      {screen !== 'SPLASH' && archiveUser && !authLoading && (
        <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
          
          {/* Left Sidebar Pane */}
          <Sidebar 
            currentScreen={screen}
            setScreen={setScreen}
            groups={groups}
            activeGroupId={activeGroupId}
            setActiveGroupId={setActiveGroupId}
            onAddGroup={handleAddFolder}
            totalNotesCount={notes.filter(n => !n.isDeleted).length}
            profileImage={profileImage}
            onOpenArchive={() => setScreen('ARCHIVE')}
            onOpenSettings={() => setShowSettingsModal(true)}
          />

          {/* Right Screens dynamic layout */}
          <div className="flex-1 flex flex-col min-h-0 bg-background relative">
            
            {/* Editor Mode Screen */}
            {screen === 'EDITOR' && (
              <NoteEditor 
                note={editingNote}
                groups={groups}
                onSave={handleSaveNote}
                onAutoSave={handleAutoSaveNote}
                onUploadImage={archiveUser ? (file) => uploadMemoImage(archiveUser.uid, file) : undefined}
                onCancel={() => {
                  draftNoteIdRef.current = null;
                  setPrefilledDate(null);
                  setScreen('DASHBOARD');
                }}
              />
            )}

            {/* Search Mode Screen */}
            {screen === 'SEARCH' && (
              <SearchView 
                notes={notes}
                groups={groups}
                onSelectNote={(id) => {
                  setSelectedNoteId(id);
                  setScreen('DASHBOARD');
                }}
                onAddNote={() => handleStartAddNote()}
              />
            )}

            {/* Calendar Mode Screen */}
            {screen === 'CALENDAR' && (
              <CalendarView 
                notes={notes}
                groups={groups}
                onSelectNote={(id) => {
                  setSelectedNoteId(id);
                  setScreen('DASHBOARD');
                }}
                onAddNoteWithDate={(date) => handleStartAddNote(date)}
              />
            )}

            {screen === 'ARCHIVE' && (
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar bg-background">
                <ArchiveView integratedUser={archiveUser} onIntegratedLogout={logoutArchiveAccount} />
              </div>
            )}

            {/* Main Dashboard Screen (List & Reading Pane Split) */}
            {screen === 'DASHBOARD' && (
              <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
                
                {/* Dashboard Header Bar */}
                <header className="sticky top-0 w-full flex flex-col sm:flex-row justify-between gap-3 sm:items-center px-4 md:px-8 py-3 sm:h-16 z-20 bg-background/90 backdrop-blur-md border-b border-grid-line shrink-0">
                  <div className="flex items-center gap-4 flex-1 w-full sm:max-w-xl">
                    <div className="relative w-full">
                      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="메모, 일정을 즉시 검색해 보세요..."
                        className="w-full h-11 pl-12 pr-4 bg-surface rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-sm text-on-surface placeholder:text-outline"
                        value={dashboardSearchQuery}
                        onChange={(e) => setDashboardSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleLaunchSearch}
                      className="hover:bg-surface rounded-full p-2.5 transition-all text-on-surface-variant cursor-pointer"
                      title="상세 태그 검색 이동"
                    >
                      <Search className="w-5 h-5 text-primary stroke-[2.5]" />
                    </button>
                    <button 
                      onClick={() => setShowSettingsModal(true)}
                      className="hover:bg-surface rounded-full p-2.5 transition-all text-on-surface-variant cursor-pointer"
                      title="설정 및 테마 변경"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    
                    <div className="h-8 w-[1px] bg-outline-variant/60 mx-2" />
                    
                    <button 
                      onClick={() => handleStartAddNote()}
                      className="flex items-center gap-2 bg-primary text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-soft hover:brightness-110 active:scale-95 transition-all font-semibold text-sm cursor-pointer"
                    >
                      <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                      <span>추가</span>
                    </button>
                  </div>
                </header>

                {/* Dashboard 2-Pane Content */}
                <div className="flex flex-col xl:flex-row flex-1 min-h-0 overflow-hidden">
                  
                  {/* Note List Pane (Middle) */}
                  <section className="w-full xl:w-[360px] max-h-[42vh] xl:max-h-none min-h-0 border-b xl:border-b-0 xl:border-r border-grid-line flex flex-col bg-surface-bright shrink-0">
                    <div className="p-4 flex items-center justify-between shrink-0">
                      <h2 className="font-sans text-lg font-bold text-on-surface px-2">
                        {activeGroupId === 'all' && '최근 메모'}
                        {activeGroupId === 'starred' && '중요 메모'}
                        {activeGroupId === 'trash' && '휴지통'}
                        {activeGroupId !== 'all' && activeGroupId !== 'starred' && activeGroupId !== 'trash' && (groups.find(g => g.id === activeGroupId)?.name + ' 폴더')}
                      </h2>
                      
                      <button 
                        onClick={() => setDashboardSortDesc(!dashboardSortDesc)}
                        className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
                        title={dashboardSortDesc ? "오래된 순 정렬" : "최신 순 정렬"}
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Scrollable Cards list */}
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar px-4 space-y-3 pb-24">
                      {filteredDashboardNotes.length === 0 ? (
                        <div className="text-center py-20 opacity-40 select-none">
                          <FileText className="w-10 h-10 text-outline mx-auto mb-2 stroke-[1.25]" />
                          <p className="text-xs font-semibold text-on-surface-variant">표시할 메모가 없습니다</p>
                          <p className="text-[10px] text-outline mt-1">오른쪽 위의 추가 버튼을 눌러 메모를 작성하세요.</p>
                        </div>
                      ) : (
                        filteredDashboardNotes.map((note) => {
                          const isActive = selectedNote?.id === note.id;
                          const noteCategory = groups.find(g => g.id === note.groupId)?.name || '개인';
                          return (
                            <div 
                              key={note.id}
                              onClick={() => setSelectedNoteId(note.id)}
                              className={`p-4 rounded-xl shadow-soft transition-all border cursor-pointer flex flex-col gap-2 relative ${
                                isActive 
                                  ? 'bg-surface-container-lowest border-primary ring-2 ring-primary shadow-md' 
                                  : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline hover:bg-surface-container-lowest'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                                  isActive ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                                }`}>
                                  {noteCategory}
                                </span>
                                <span className="text-[10px] text-outline font-semibold">
                                  {note.createdAt.split(' ').pop()} {/* Show only time for card compactness */}
                                </span>
                              </div>

                              <h3 className={`font-sans text-sm font-bold tracking-tight truncate ${
                                isActive ? 'text-primary' : 'text-on-surface'
                              }`}>
                                {note.title}
                              </h3>

                              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                                {note.content}
                              </p>

                              {note.images && note.images.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[9px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded w-max mt-1">
                                  <ImageIcon className="w-3 h-3" />
                                  이미지 {note.images.length}장 첨부
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>

                  {/* Note Reading Pane (Right) */}
                  <NoteDetail 
                    note={selectedNote}
                    groups={groups}
                    onEdit={() => selectedNote && handleStartEditNote(selectedNote)}
                    onDelete={handleDeleteNote}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleChecklistItem={handleToggleChecklistItem}
                  />

                </div>

                {/* Floating Action Button (FAB) on Dashboard screen */}
                <button 
                  onClick={() => handleStartAddNote()}
                  className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 bg-primary text-white rounded-xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-30 cursor-pointer"
                  title="새 메모 작성"
                >
                  <Plus className="w-8 h-8 text-white stroke-[2]" />
                </button>

              </div>
            )}

          </div>

        </div>
      )}

      {/* Ambient paper texture layer across the entire app */}
      {screen !== 'SPLASH' && (
        <div className="fixed inset-0 pointer-events-none opacity-[0.02] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] z-50" />
      )}

      {/* Settings Panel Modal popover */}
      {showSettingsModal && (
        <SettingsModal 
          onClose={() => setShowSettingsModal(false)}
          profileImage={profileImage}
          onUpdateProfileImage={async (file) => {
            if (!archiveUser) throw new Error('로그인 후 프로필 이미지를 저장할 수 있습니다.');
            const imageUrl = await uploadMemoProfileImage(archiveUser.uid, file);
            setProfileImage(imageUrl);
            await saveMemoCloudState(archiveUser.uid, { darkMode, groups, notes, profileImage: imageUrl });
            setArchiveStatus('프로필 이미지가 자료실 Storage에 저장되었습니다.');
          }}
          darkMode={darkMode}
          onToggleDarkMode={(enabled) => setDarkMode(enabled)}
          archiveUserEmail={archiveUser?.email || ''}
          archiveStatus={archiveStatus}
          firebaseConfigured={isFirebaseConfigured}
          onArchiveLogin={async (email, password) => {
            setArchiveStatus('자료실 계정에 로그인하는 중입니다.');
            try {
              await loginArchiveAccount(email, password);
              setArchiveStatus('자료실 계정에 로그인했습니다.');
            } catch (error) {
              setArchiveStatus(error instanceof Error ? error.message : '로그인에 실패했습니다.');
            }
          }}
          onArchiveLogout={async () => {
            await logoutArchiveAccount();
            setArchiveStatus('자료실 계정에서 로그아웃했습니다.');
          }}
          onArchivePasswordReset={async (email) => {
            await resetArchivePassword(email);
            setArchiveStatus('비밀번호 재설정 메일을 보냈습니다.');
          }}
          isInstallable={!!deferredPrompt}
          onInstall={handleInstallApp}
        />
      )}
    </div>
  );
}
