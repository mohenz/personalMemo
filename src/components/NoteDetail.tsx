import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Star, 
  CheckCircle, 
  Map, 
  Type, 
  Image as ImageIcon, 
  Paintbrush, 
  Mic, 
  Share2, 
  MoreVertical,
  CheckSquare,
  Square,
  FolderOpen
} from 'lucide-react';
import { Note, Group } from '../types';

interface NoteDetailProps {
  note: Note | null;
  groups: Group[];
  onEdit: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
}

export default function NoteDetail({
  note,
  groups,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleChecklistItem
}: NoteDetailProps) {
  const [showShareToast, setShowShareToast] = useState(false);
  const [showFormatToast, setShowFormatToast] = useState(false);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background notebook-pattern p-8 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 text-on-surface-variant animate-pulse">
          <FolderOpen className="w-8 h-8" />
        </div>
        <h3 className="font-sans text-lg font-bold text-on-surface mb-1">메모가 선택되지 않았습니다</h3>
        <p className="font-sans text-sm text-text-secondary max-w-xs">
          왼쪽 목록에서 메모를 선택하거나 오른쪽 아래의 추가(+) 버튼을 눌러 새 메모를 작성해 보세요.
        </p>
      </div>
    );
  }

  const groupName = groups.find(g => g.id === note.groupId)?.name || '개인';

  const handleShare = () => {
    // Mimic share behavior
    const shareUrl = `${window.location.origin}/notes/${note.id}`;
    navigator.clipboard?.writeText(shareUrl);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const handleDrawing = () => {
    alert("그리기 모드: S-Pen 그리기 도구가 연결되었습니다. (데모 시뮬레이션: 격자 무늬 배경 위에서 필기가 활성화됩니다.)");
  };

  const handleVoice = () => {
    alert("음성 녹음: 메모에 첨부할 보이스 레코딩 세션이 시작되었습니다.");
  };

  return (
    <section className="flex-1 flex flex-col relative overflow-hidden bg-background">
      
      {/* Top Header Controls / Writing Tools Overlay */}
      <div className="absolute top-4 right-8 flex items-center gap-2 z-20">
        <button 
          onClick={() => onToggleFavorite(note.id)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            note.isFavorite 
              ? 'bg-yellow-50 text-yellow-500 shadow-sm' 
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
          }`}
          title={note.isFavorite ? "중요 메모 해제" : "중요 메모 추가"}
        >
          <Star className={`w-5 h-5 ${note.isFavorite ? 'fill-current' : ''}`} />
        </button>

        <button 
          onClick={onEdit}
          className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
          title="수정하기"
        >
          <Edit className="w-5 h-5" />
        </button>

        <button 
          onClick={() => {
            if (confirm("이 메모를 정말 삭제하시겠습니까?")) {
              onDelete(note.id);
            }
          }}
          className="w-10 h-10 rounded-full bg-surface-container-high text-error flex items-center justify-center hover:bg-error hover:text-white transition-all shadow-sm"
          title={note.isDeleted ? "영구 삭제" : "휴지통으로 이동"}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Reading/Lined Canvas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-12 pb-32 notebook-pattern select-text">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Metadata & Title Block */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                {groupName}
              </span>
              <span className="text-outline text-xs font-medium">
                최종 수정: {note.updatedAt}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-on-background tracking-tight leading-snug">
              {note.title}
            </h2>
          </div>

          {/* Body Content */}
          <div className="prose prose-slate max-w-none">
            <p className="text-lg leading-8 text-on-surface-variant font-medium whitespace-pre-wrap">
              {note.content}
            </p>

            {/* Attached Image Grid (Hotlinks) */}
            {note.images && note.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 my-8">
                {note.images.map((imgUrl, index) => (
                  <div 
                    key={index} 
                    className="group relative overflow-hidden rounded-2xl shadow-md aspect-video cursor-zoom-in border border-outline-variant"
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Attached document asset ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>
            )}

            {/* Checklist Section */}
            {note.checklist && note.checklist.length > 0 && (
              <div className="space-y-4 my-6">
                <h4 className="font-bold text-lg text-on-surface flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>주요 일정 / 할 일</span>
                </h4>
                <ul className="space-y-3 pl-1 border-l-4 border-primary/20">
                  {note.checklist.map((item) => (
                    <li 
                      key={item.id} 
                      onClick={() => onToggleChecklistItem(note.id, item.id)}
                      className="flex items-start gap-3 cursor-pointer group select-none pl-4 py-0.5"
                    >
                      <button className="text-primary hover:scale-105 transition-transform shrink-0 mt-0.5">
                        {item.done ? (
                          <CheckSquare className="w-5 h-5 text-primary fill-primary/10" />
                        ) : (
                          <Square className="w-5 h-5 text-outline-variant group-hover:text-primary" />
                        )}
                      </button>
                      <span className={`text-base font-medium transition-all ${
                        item.done 
                          ? 'line-through text-outline font-normal opacity-60' 
                          : 'text-on-surface-variant group-hover:text-on-surface'
                      }`}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Location Map Placeholder Block */}
            <div className="mt-12 p-6 bg-surface-container rounded-2xl border-2 border-dashed border-outline-variant">
              <h4 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                <span>위치 정보</span>
              </h4>
              <div className="h-44 w-full rounded-xl overflow-hidden shadow-inner relative bg-surface-dim border border-outline-variant">
                <div className="w-full h-full flex flex-col items-center justify-center text-outline-variant italic bg-surface relative p-4">
                  <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#0058be_1px,transparent_1px)]" style={{ backgroundSize: '16px 16px' }} />
                  <Map className="w-8 h-8 text-outline mb-2 stroke-[1.25]" />
                  <span className="text-sm font-semibold text-on-surface-variant not-italic mb-1">
                    Jeju Island, South Korea
                  </span>
                  <span className="text-xs text-outline">
                    [지도 데이터 수집 완료: 제주도 서귀포시 안덕면]
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Toolbar at the bottom of the reading section */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-on-background/95 text-white px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl backdrop-blur-md z-20">
        <button 
          onClick={() => {
            setShowFormatToast(true);
            setTimeout(() => setShowFormatToast(false), 2000);
          }}
          className="flex flex-col items-center gap-1 text-white hover:text-primary-fixed-dim transition-colors cursor-pointer"
        >
          <Type className="w-5 h-5" />
          <span className="text-[10px] font-bold">서식</span>
        </button>

        <button 
          onClick={onEdit}
          className="flex flex-col items-center gap-1 text-white hover:text-primary-fixed-dim transition-colors cursor-pointer"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">사진</span>
        </button>

        <button 
          onClick={handleDrawing}
          className="flex flex-col items-center gap-1 text-white hover:text-primary-fixed-dim transition-colors cursor-pointer"
        >
          <Paintbrush className="w-5 h-5" />
          <span className="text-[10px] font-bold">그리기</span>
        </button>

        <button 
          onClick={handleVoice}
          className="flex flex-col items-center gap-1 text-white hover:text-primary-fixed-dim transition-colors cursor-pointer"
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px] font-bold">음성</span>
        </button>

        <div className="w-[1px] h-6 bg-outline-variant/30" />

        <button 
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-white hover:text-primary-fixed-dim transition-colors cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-[10px] font-bold">공유</span>
        </button>
      </div>

      {/* Temporary Interactivity Toasts */}
      {showShareToast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-4 py-2 rounded-full shadow-lg font-semibold animate-fade-in-scale z-30">
          공유 링크가 클립보드에 복사되었습니다! 🔗
        </div>
      )}

      {showFormatToast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2 rounded-full shadow-lg font-semibold animate-fade-in-scale z-30">
          서식 도구: 'Manrope 폰트'가 완벽하게 적용되었습니다. 📝
        </div>
      )}
    </section>
  );
}
