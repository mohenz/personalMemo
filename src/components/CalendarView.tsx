import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  Edit3, 
  CheckSquare, 
  Trash2,
  FolderOpen
} from 'lucide-react';
import { Note, Group } from '../types';

interface CalendarViewProps {
  notes: Note[];
  groups: Group[];
  onSelectNote: (noteId: string) => void;
  onAddNoteWithDate: (dateString: string) => void;
}

export default function CalendarView({
  notes,
  groups,
  onSelectNote,
  onAddNoteWithDate
}: CalendarViewProps) {
  // Set July 2026 as the active calendar month
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [searchQuery, setSearchQuery] = useState('');

  // June 28, 29, 30 are padded days of previous month.
  // July starts on Wednesday, July 1st, 2026.
  const paddingDays = [28, 29, 30];
  const julyDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const nextMonthPadding = [1, 2];

  // Helper to get formatted string for July 2026
  const getFormattedDateString = (day: number) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    return `2026-07-${dayStr}`;
  };

  // Find all notes written on a specific day in July 2026
  const getNotesForDay = (day: number) => {
    const dateStr = getFormattedDateString(day);
    return notes.filter(note => !note.isDeleted && note.dateString === dateStr);
  };

  // Get notes for currently selected day
  const selectedDayNotes = useMemo(() => {
    return getNotesForDay(selectedDay);
  }, [notes, selectedDay]);

  // List of all days in July 2026 that have at least one note
  const daysWithNotes = useMemo(() => {
    const daySet = new Set<number>();
    for (let day = 1; day <= 31; day++) {
      if (getNotesForDay(day).length > 0) {
        daySet.add(day);
      }
    }
    return daySet;
  }, [notes]);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none relative">
      
      {/* Top Calendar Header Controls */}
      <header className="sticky top-0 w-full flex flex-col md:flex-row justify-between gap-3 md:items-center px-4 md:px-8 py-3 md:h-16 z-20 bg-background/80 backdrop-blur-md border-b border-grid-line">
        <div className="flex items-center gap-4 md:gap-6">
          <span className="font-sans text-xl font-bold text-on-background">2026년 7월</span>
          
          <div className="flex items-center bg-surface-container rounded-full p-1">
            <button className="p-1 hover:bg-surface-dim rounded-full transition-all active:scale-90 text-on-surface-variant cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setSelectedDay(15)} // Reset to 15 (mock today)
              className="px-4 py-1 font-sans text-xs font-bold text-primary bg-surface-container-lowest rounded-full shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              오늘
            </button>
            <button className="p-1 hover:bg-surface-dim rounded-full transition-all active:scale-90 text-on-surface-variant cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Actions block */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text" 
              placeholder="일정 검색..."
              className="bg-surface border border-transparent rounded-xl h-10 pl-9 pr-4 w-48 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-xs font-medium text-on-surface placeholder:text-outline"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            onClick={() => onAddNoteWithDate(getFormattedDateString(selectedDay))}
            className="bg-primary text-white text-xs font-bold px-4 h-10 rounded-xl flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-soft cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>새 메모</span>
          </button>
        </div>
      </header>

      {/* 2-Pane Content: Monthly Grid (Left) & Selected Day Sidebar (Right) */}
      <div className="flex-1 flex flex-col xl:flex-row min-h-0 overflow-hidden">
        
        {/* Left Side: Calendar Grid */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar">
          <div className="bg-surface-container-lowest rounded-xl notebook-shadow border border-grid-line overflow-hidden min-w-[720px] xl:min-w-0">
            
            {/* Day of Week Header row */}
            <div className="grid grid-cols-7 border-b border-grid-line bg-surface-container-low text-xs font-bold py-3 text-center text-on-surface-variant">
              <div className="text-error">일</div>
              <div>월</div>
              <div>화</div>
              <div>수</div>
              <div>목</div>
              <div>금</div>
              <div className="text-primary">토</div>
            </div>

            {/* Days Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)]">
              
              {/* Padding days from previous month (June) */}
              {paddingDays.map((day) => (
                <div 
                  key={`prev-${day}`} 
                  className="border-r border-b border-grid-line p-3 bg-slate-50/50 opacity-40 text-on-surface-variant text-xs font-bold select-none cursor-not-allowed"
                >
                  {day}
                </div>
              ))}

              {/* July days */}
              {julyDays.map((day) => {
                // Sunday check (starts Wednesday, index 3. indices: Wed=1, Thu=2, Fri=3, Sat=4, Sun=5, Mon=6, Tue=7 -> Sun is index 5, 12, 19, 26)
                const isSunday = (day + 2) % 7 === 0;
                // Saturday check
                const isSaturday = (day + 2) % 7 === 6;
                const hasNote = daysWithNotes.has(day);
                const isSelected = day === selectedDay;
                const dayNotesList = getNotesForDay(day);

                return (
                  <div
                    key={`july-${day}`}
                    onClick={() => handleDayClick(day)}
                    className={`border-r border-b border-grid-line p-3 flex flex-col justify-between hover:bg-primary/5 cursor-pointer transition-colors relative group ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${
                        isSelected 
                          ? 'bg-primary text-white shadow-soft font-extrabold' 
                          : isSunday 
                            ? 'text-error' 
                            : isSaturday 
                              ? 'text-primary' 
                              : 'text-on-surface'
                      }`}>
                        {day}
                      </span>
                      
                      {hasNote && (
                        <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1" />
                      )}
                    </div>

                    {/* Previews of note titles on that day */}
                    <div className="mt-2 flex flex-col gap-1 w-full overflow-hidden">
                      {dayNotesList.slice(0, 2).map((n) => (
                        <div 
                          key={n.id}
                          className="bg-surface border-l-2 border-primary text-[10px] font-bold text-on-surface-variant truncate px-1.5 py-0.5 rounded shadow-2xs max-w-full"
                          title={n.title}
                        >
                          {n.title}
                        </div>
                      ))}
                      {dayNotesList.length > 2 && (
                        <span className="text-[9px] text-outline font-bold pl-1">+{dayNotesList.length - 2}개 더보기</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Next Month padding (August) */}
              {nextMonthPadding.map((day) => (
                <div 
                  key={`next-${day}`} 
                  className="border-r border-b border-grid-line p-3 bg-slate-50/50 opacity-40 text-on-surface-variant text-xs font-bold select-none cursor-not-allowed"
                >
                  {day}
                </div>
              ))}

            </div>

          </div>
        </div>

        {/* Right Side: Selected Day Summary list panel */}
        <aside className="w-full xl:w-[360px] max-h-[38vh] xl:max-h-none border-t xl:border-t-0 xl:border-l border-grid-line bg-surface-container-low flex flex-col shrink-0">
          <div className="p-6 flex flex-col h-full justify-between gap-4">
            
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-lg font-bold text-on-surface">7월 {selectedDay}일 일정</h2>
                <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant font-bold">
                  {selectedDayNotes.length}개의 메모
                </span>
              </div>

              {/* Schedule list */}
              {selectedDayNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 opacity-40">
                  <FolderOpen className="w-10 h-10 text-outline mb-2 stroke-[1.25]" />
                  <p className="text-xs font-semibold text-on-surface">기록된 메모가 없습니다</p>
                  <p className="text-[10px] text-outline mt-1">오늘의 새 메모를 추가해 보세요.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayNotes.map((note) => {
                    const groupName = groups.find(g => g.id === note.groupId)?.name || '개인';
                    return (
                      <div 
                        key={note.id}
                        onClick={() => onSelectNote(note.id)}
                        className="bg-surface-container-lowest p-4 rounded-xl shadow-soft border border-transparent hover:border-primary transition-all cursor-pointer group flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-sans text-sm font-bold text-primary group-hover:text-primary-container truncate flex-1">
                            {note.title}
                          </h3>
                          <span className="text-[10px] text-outline font-semibold shrink-0 ml-2">
                            {note.createdAt.split(' ').pop()} {/* Just show time */}
                          </span>
                        </div>
                        
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                          {note.content}
                        </p>

                        <div className="flex gap-2 mt-1">
                          <span className="bg-surface-container-high text-[10px] px-2 py-0.5 rounded text-on-surface-variant font-bold uppercase tracking-wider">
                            #{groupName}
                          </span>
                          {note.checklist && note.checklist.length > 0 && (
                            <span className="bg-primary/5 text-primary text-[10px] px-2 py-0.5 rounded font-bold">
                              ✓ {note.checklist.filter(c => c.done).length}/{note.checklist.length}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Action Bottom Button */}
            <button 
              onClick={() => onAddNoteWithDate(getFormattedDateString(selectedDay))}
              className="bg-primary/10 text-primary border border-primary/20 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all text-sm font-bold cursor-pointer shadow-2xs active:scale-95 shrink-0"
            >
              <Edit3 className="w-4 h-4" />
              <span>오늘의 새 메모 추가</span>
            </button>

          </div>
        </aside>

      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => onAddNoteWithDate(getFormattedDateString(selectedDay))}
        className="hidden xl:flex absolute bottom-8 right-[384px] w-14 h-14 bg-primary text-white rounded-xl shadow-2xl items-center justify-center hover:scale-105 active:scale-95 transition-transform z-30 cursor-pointer"
        title="새 메모"
      >
        <Edit3 className="w-5 h-5 text-white stroke-[2]" />
      </button>

      {/* Paper Texture Overlay for Notebook Feel */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
    </div>
  );
}
