import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  MoreVertical, 
  Plus, 
  X, 
  PlusCircle, 
  CheckSquare, 
  Trash2,
  FolderOpen
} from 'lucide-react';
import { Note, Group, ChecklistItem } from '../types';
import { PREMIUM_IMAGES } from '../data';

interface NoteEditorProps {
  note: Note | null; // null if creating a new note
  groups: Group[];
  onSave: (noteData: Partial<Note>) => void;
  onCancel: () => void;
}

export default function NoteEditor({
  note,
  groups,
  onSave,
  onCancel
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [groupId, setGroupId] = useState(note?.groupId || groups[0]?.id || 'personal');
  const [images, setImages] = useState<string[]>(note?.images || []);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(note?.checklist || []);
  const [newTodoText, setNewTodoText] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleSave = () => {
    if (!title.trim()) {
      alert("메모 제목을 입력해 주세요.");
      return;
    }
    onSave({
      title: title.trim(),
      content: content,
      groupId: groupId,
      images: images,
      checklist: checklist,
      updatedAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) + ' ' + new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    });
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      const newItem: ChecklistItem = {
        id: 'todo-' + Date.now(),
        text: newTodoText.trim(),
        done: false
      };
      setChecklist([...checklist, newItem]);
      setNewTodoText('');
    }
  };

  const handleRemoveTodo = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleAddImage = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
    setShowImagePicker(false);
  };

  const handleRemoveImage = (url: string) => {
    setImages(images.filter(img => img !== url));
  };

  return (
    <section className="flex-1 bg-background flex flex-col overflow-hidden h-full relative">
      
      {/* Editor Top App Bar */}
      <header className="sticky top-0 w-full flex justify-between items-center px-6 h-16 z-20 bg-background/95 backdrop-blur-md border-b border-grid-line shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onCancel}
            className="hover:bg-surface-container rounded-full p-2 transition-all active:scale-95 text-on-surface"
            title="돌아가기 (취소)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <input 
            type="text"
            className="bg-transparent border-none focus:outline-none focus:ring-0 font-sans text-xl font-bold text-on-background w-full max-w-lg placeholder:text-outline-variant"
            placeholder="제목을 입력하세요..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Group Folder Dropdown Selector */}
          <div className="flex items-center bg-surface px-3 py-1.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface">
            <span className="text-outline mr-2 text-xs uppercase">그룹:</span>
            <select 
              value={groupId} 
              onChange={(e) => setGroupId(e.target.value)}
              className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-primary cursor-pointer focus:outline-none"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:brightness-115 active:scale-95 transition-all text-sm font-semibold shadow-soft cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>저장</span>
          </button>

          <button 
            onClick={() => setShowImagePicker(true)}
            className="hover:bg-surface-container rounded-full p-2 transition-all text-on-surface-variant cursor-pointer"
            title="이미지 첨부"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Notebook Grid Canvas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar notebook-grid p-8 md:p-12">
        <div className="max-w-3xl mx-auto space-y-6 bg-surface-container-lowest/70 backdrop-blur-xs p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-xs">
          
          {/* Core Content Textarea */}
          <textarea 
            className="w-full min-h-[400px] bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-on-surface font-sans text-base leading-8 resize-none"
            placeholder="여기에 내용을 입력하세요..."
            style={{ minHeight: '360px', lineHeight: '28px' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Inline Todo Checklist Builder */}
          <div className="border-t border-grid-line pt-6">
            <h4 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-2 uppercase tracking-wide text-outline">
              <CheckSquare className="w-4.5 h-4.5 text-primary" />
              <span>할 일 / 체크리스트 등록</span>
            </h4>
            
            {/* Quick Checklist list */}
            {checklist.length > 0 && (
              <div className="flex flex-col gap-2 mb-4 pl-1">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group bg-surface rounded-xl px-3 py-2 border border-outline-variant/30">
                    <span className="text-sm text-on-surface-variant font-medium">
                      {item.text}
                    </span>
                    <button 
                      onClick={() => handleRemoveTodo(item.id)}
                      className="text-outline-variant hover:text-error transition-colors p-1 rounded-lg hover:bg-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Checklist Add Input */}
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <input
                type="text"
                placeholder="새 일정을 입력하고 추가를 누르세요"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className="flex-1 h-10 px-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              />
              <button 
                type="submit"
                className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 h-10 rounded-xl transition-all font-semibold text-sm flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>추가</span>
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Premium Attachment Bar at the bottom */}
      <footer className="bg-white/95 backdrop-blur-md border-t border-grid-line p-4 z-10 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          {/* Dynamic Square Photo Picker Button */}
          <div 
            onClick={() => setShowImagePicker(true)}
            className="flex-shrink-0 w-16 h-16 bg-surface-container-high rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-outline-variant cursor-pointer hover:bg-surface-container-highest hover:border-primary transition-colors text-primary"
            title="이미지 추가"
          >
            <ImageIcon className="w-6 h-6 stroke-[1.5]" />
            <span className="text-[10px] font-bold mt-1">첨부</span>
          </div>

          {/* Slider list of attached thumbnails */}
          {images.length === 0 ? (
            <div className="flex-1 text-xs text-outline font-medium italic pl-2 select-none">
              첨부된 사진이 없습니다. 첨부 버튼을 누르거나 펜 버튼을 눌러 스태프 일러스트를 삽입할 수 있습니다.
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto no-scrollbar flex gap-3 py-1">
              {images.map((imgUrl, index) => (
                <div key={index} className="relative group flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-outline-variant shadow-sm bg-cover bg-center" style={{ backgroundImage: `url(${imgUrl})` }} />
                  <button 
                    onClick={() => handleRemoveImage(imgUrl)}
                    className="absolute -top-1.5 -right-1.5 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all text-xs border border-white cursor-pointer"
                    title="제거"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </footer>

      {/* Premium Digital Stationery Asset Selector Modal */}
      {showImagePicker && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in-scale">
          <div className="bg-white p-6 rounded-2xl w-[480px] max-w-full shadow-2xl border border-outline-variant flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span>디지털 스테이셔너리 에셋 추가</span>
              </h3>
              <button 
                onClick={() => setShowImagePicker(false)}
                className="text-on-surface-variant hover:bg-surface rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-on-surface-variant">
              이 메모와 어울리는 고해상도 디자인 라이브러리 일러스트를 선택하여 노트를 더욱 아름답게 장식하세요.
            </p>

            <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[300px] p-1 custom-scrollbar">
              <button 
                onClick={() => handleAddImage(PREMIUM_IMAGES.jejuSunset)}
                className="border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:scale-[1.02] hover:border-primary transition-all text-left flex flex-col cursor-pointer"
              >
                <div className="h-16 w-full bg-cover bg-center" style={{ backgroundImage: `url(${PREMIUM_IMAGES.jejuSunset})` }} />
                <span className="p-1.5 text-[10px] font-bold text-on-surface-variant truncate">제주 노을 해변</span>
              </button>

              <button 
                onClick={() => handleAddImage(PREMIUM_IMAGES.jejuDesk)}
                className="border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:scale-[1.02] hover:border-primary transition-all text-left flex flex-col cursor-pointer"
              >
                <div className="h-16 w-full bg-cover bg-center" style={{ backgroundImage: `url(${PREMIUM_IMAGES.jejuDesk})` }} />
                <span className="p-1.5 text-[10px] font-bold text-on-surface-variant truncate">여행자 데스크</span>
              </button>

              <button 
                onClick={() => handleAddImage(PREMIUM_IMAGES.office)}
                className="border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:scale-[1.02] hover:border-primary transition-all text-left flex flex-col cursor-pointer"
              >
                <div className="h-16 w-full bg-cover bg-center" style={{ backgroundImage: `url(${PREMIUM_IMAGES.office})` }} />
                <span className="p-1.5 text-[10px] font-bold text-on-surface-variant truncate">미니멀 워크스페이스</span>
              </button>

              <button 
                onClick={() => handleAddImage(PREMIUM_IMAGES.gridPaper)}
                className="border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:scale-[1.02] hover:border-primary transition-all text-left flex flex-col cursor-pointer"
              >
                <div className="h-16 w-full bg-cover bg-center" style={{ backgroundImage: `url(${PREMIUM_IMAGES.gridPaper})` }} />
                <span className="p-1.5 text-[10px] font-bold text-on-surface-variant truncate">태블릿 펜 & 그리드</span>
              </button>

              <button 
                onClick={() => handleAddImage(PREMIUM_IMAGES.azureGradients)}
                className="border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:scale-[1.02] hover:border-primary transition-all text-left flex flex-col cursor-pointer"
              >
                <div className="h-16 w-full bg-cover bg-center" style={{ backgroundImage: `url(${PREMIUM_IMAGES.azureGradients})` }} />
                <span className="p-1.5 text-[10px] font-bold text-on-surface-variant truncate">아쿠아 그래디언트</span>
              </button>

              <button 
                onClick={() => handleAddImage(PREMIUM_IMAGES.moodBoard)}
                className="border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:scale-[1.02] hover:border-primary transition-all text-left flex flex-col cursor-pointer"
              >
                <div className="h-16 w-full bg-cover bg-center" style={{ backgroundImage: `url(${PREMIUM_IMAGES.moodBoard})` }} />
                <span className="p-1.5 text-[10px] font-bold text-on-surface-variant truncate">뮤티드 무드보드</span>
              </button>
            </div>

            <div className="border-t border-grid-line pt-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">직접 이미지 URL 입력</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="custom-img-url"
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 h-9 px-2 text-xs border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
                <button 
                  onClick={() => {
                    const el = document.getElementById('custom-img-url') as HTMLInputElement;
                    if (el && el.value.trim()) {
                      handleAddImage(el.value.trim());
                      el.value = '';
                    }
                  }}
                  className="bg-primary text-white text-xs px-3 rounded-lg hover:brightness-110 active:scale-95 transition-all font-semibold cursor-pointer"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
