/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Settings, 
  Bell, 
  SlidersHorizontal,
  ChevronDown,
  FileText
} from 'lucide-react';
import { Note, Group, ScreenType } from './types';
import { DEFAULT_NOTES, DEFAULT_GROUPS, PREMIUM_IMAGES } from './data';
import SplashView from './components/SplashView';
import Sidebar from './components/Sidebar';
import NoteDetail from './components/NoteDetail';
import NoteEditor from './components/NoteEditor';
import SearchView from './components/SearchView';
import CalendarView from './components/CalendarView';
import SettingsModal from './components/SettingsModal';

export default function App() {
  // --- Screen State Control ---
  const [screen, setScreen] = useState<ScreenType>('SPLASH');

  // --- Settings & Theme States ---
  const [profileImage, setProfileImage] = useState<string>(() => {
    return localStorage.getItem('personal_notes_profile_img') || PREMIUM_IMAGES.userProfile;
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('personal_notes_dark_mode') === 'true';
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Sync settings back to LocalStorage
  useEffect(() => {
    localStorage.setItem('personal_notes_profile_img', profileImage);
  }, [profileImage]);

  useEffect(() => {
    localStorage.setItem('personal_notes_dark_mode', String(darkMode));
  }, [darkMode]);

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

  // --- Core State with LocalStorage Sync ---
  const [notes, setNotes] = useState<Note[]>(() => {
    const local = localStorage.getItem('personal_notes_data');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse notes from localStorage', e);
      }
    }
    return DEFAULT_NOTES;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const local = localStorage.getItem('personal_notes_folders');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse folders from localStorage', e);
      }
    }
    return DEFAULT_GROUPS;
  });

  // --- Navigation & Filter Controls ---
  const [activeGroupId, setActiveGroupId] = useState<string>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string>('note-1');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');
  const [dashboardSortDesc, setDashboardSortDesc] = useState(true);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);

  // Sync state back to LocalStorage
  useEffect(() => {
    localStorage.setItem('personal_notes_data', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('personal_notes_folders', JSON.stringify(groups));
  }, [groups]);

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
    setEditingNote(null);
    setPrefilledDate(withDate || null);
    setScreen('EDITOR');
  };

  const handleStartEditNote = (note: Note) => {
    setEditingNote(note);
    setScreen('EDITOR');
  };

  const handleSaveNote = (editedFields: Partial<Note>) => {
    if (editingNote) {
      // Editing Mode
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id ? { ...note, ...editedFields } as Note : note
      ));
      setSelectedNoteId(editingNote.id);
    } else {
      // Creating Mode
      const today = new Date();
      const dateStr = prefilledDate || today.toISOString().split('T')[0]; // Pre-filled or current date
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
      setNotes(prev => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
    }
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

  // --- Render Router ---
  return (
    <div className={`flex w-full h-screen bg-background text-on-surface font-sans overflow-hidden select-none ${darkMode ? 'dark' : ''}`}>
      
      {/* 1. Splash Screen Mode */}
      {screen === 'SPLASH' && (
        <SplashView onComplete={handleSplashComplete} />
      )}

      {/* Main app layouts */}
      {screen !== 'SPLASH' && (
        <div className="flex h-screen w-full overflow-hidden">
          
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
            onOpenSettings={() => setShowSettingsModal(true)}
          />

          {/* Right Screens dynamic layout */}
          <div className="flex-1 flex flex-col h-full bg-background relative">
            
            {/* Editor Mode Screen */}
            {screen === 'EDITOR' && (
              <NoteEditor 
                note={editingNote}
                groups={groups}
                onSave={handleSaveNote}
                onCancel={() => {
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

            {/* Main Dashboard Screen (List & Reading Pane Split) */}
            {screen === 'DASHBOARD' && (
              <div className="flex-1 flex flex-col h-full">
                
                {/* Dashboard Header Bar */}
                <header className="sticky top-0 w-full flex justify-between items-center px-8 h-16 z-20 bg-background/90 backdrop-blur-md border-b border-grid-line shrink-0">
                  <div className="flex items-center gap-4 flex-1 max-w-xl">
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
                      className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full shadow-soft hover:brightness-110 active:scale-95 transition-all font-semibold text-sm cursor-pointer"
                    >
                      <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                      <span>추가</span>
                    </button>
                  </div>
                </header>

                {/* Dashboard 2-Pane Content */}
                <div className="flex flex-1 overflow-hidden">
                  
                  {/* Note List Pane (Middle) */}
                  <section className="w-[360px] border-r border-grid-line flex flex-col bg-surface-bright shrink-0">
                    <div className="p-4 flex items-center justify-between shrink-0">
                      <h2 className="font-sans text-lg font-bold text-on-surface px-2">
                        {activeGroupId === 'all' && '최근 메모'}
                        {activeGroupId === 'starred' && '중요 메모 ⭐'}
                        {activeGroupId === 'trash' && '휴지통 🗑️'}
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
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-3 pb-24">
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
                              className={`p-4 rounded-2xl shadow-soft transition-all border cursor-pointer flex flex-col gap-2 relative ${
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
                                <span className="text-[9px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded w-max mt-1">
                                  📸 이미지 {note.images.length}장 첨부
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
                  className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-30 cursor-pointer"
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
          onUpdateProfileImage={(url) => setProfileImage(url)}
          darkMode={darkMode}
          onToggleDarkMode={(enabled) => setDarkMode(enabled)}
          isInstallable={!!deferredPrompt}
          onInstall={handleInstallApp}
        />
      )}
    </div>
  );
}
