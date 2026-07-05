import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Star, 
  Tag, 
  Trash2, 
  FolderPlus, 
  HelpCircle, 
  Settings, 
  Briefcase, 
  User, 
  Compass, 
  Folder,
  Plus
} from 'lucide-react';
import { Group, ScreenType } from '../types';
import { PREMIUM_IMAGES } from '../data';

interface SidebarProps {
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  groups: Group[];
  activeGroupId: string; // "all", "starred", "trash", or specific group id
  setActiveGroupId: (id: string) => void;
  onAddGroup: (name: string) => void;
  totalNotesCount: number;
  profileImage: string;
  onOpenSettings: () => void;
}

export default function Sidebar({
  currentScreen,
  setScreen,
  groups,
  activeGroupId,
  setActiveGroupId,
  onAddGroup,
  totalNotesCount,
  profileImage,
  onOpenSettings
}: SidebarProps) {
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddGroup(newFolderName.trim());
      setNewFolderName('');
      setShowAddFolderModal(false);
    }
  };

  const getGroupIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'User': return <User className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      default: return <Folder className="w-5 h-5" />;
    }
  };

  return (
    <aside className="w-[280px] h-full flex flex-col border-r border-outline-variant bg-surface-container-low select-none shrink-0 z-30">
      {/* Profile Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant shadow-sm shrink-0">
            <img 
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
              src={profileImage} 
              alt="Creative Professional"
              referrerPolicy="no-referrer"
              onClick={onOpenSettings}
              title="설정 및 프로필 변경"
            />
          </div>
          <div className="cursor-pointer" onClick={onOpenSettings} title="설정 및 프로필 변경">
            <h1 className="font-sans text-lg font-bold text-on-background">내 메모장</h1>
            <p className="font-sans text-xs text-on-surface-variant">개인용 디지털 스테이셔너리</p>
          </div>
        </div>

        {/* Primary Screen Navigation */}
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => {
              setScreen('DASHBOARD');
              setActiveGroupId('all');
            }}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              currentScreen === 'DASHBOARD' && activeGroupId === 'all'
                ? 'bg-primary text-white shadow-soft font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <span>모든 메모</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              currentScreen === 'DASHBOARD' && activeGroupId === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {totalNotesCount}
            </span>
          </button>

          <button
            onClick={() => setScreen('CALENDAR')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              currentScreen === 'CALENDAR'
                ? 'bg-primary text-white shadow-soft font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>캘린더</span>
          </button>

          <button
            onClick={() => {
              setScreen('DASHBOARD');
              setActiveGroupId('starred');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              currentScreen === 'DASHBOARD' && activeGroupId === 'starred'
                ? 'bg-primary text-white shadow-soft font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <Star className={`w-5 h-5 ${currentScreen === 'DASHBOARD' && activeGroupId === 'starred' ? 'fill-current' : ''}`} />
            <span>중요 메모</span>
          </button>

          <button
            onClick={() => setScreen('SEARCH')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              currentScreen === 'SEARCH'
                ? 'bg-primary text-white shadow-soft font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span>태그 및 검색</span>
          </button>

          {/* Group Folder Divider */}
          <div className="pt-5 pb-2 px-4 flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider">그룹 폴더</span>
            <button 
              onClick={() => setShowAddFolderModal(true)} 
              className="p-1 rounded-md hover:bg-surface-container-high text-primary transition-colors"
              title="새 폴더 추가"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Folder Items */}
          <div className="max-h-[220px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setScreen('DASHBOARD');
                  setActiveGroupId(group.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium ${
                  currentScreen === 'DASHBOARD' && activeGroupId === group.id
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {getGroupIcon(group.icon)}
                <span className="truncate">{group.name}</span>
              </button>
            ))}
          </div>

          <div className="my-1 border-t border-outline-variant/30" />

          {/* Trash Navigation */}
          <button
            onClick={() => {
              setScreen('DASHBOARD');
              setActiveGroupId('trash');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              currentScreen === 'DASHBOARD' && activeGroupId === 'trash'
                ? 'bg-red-50 text-red-700 font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <Trash2 className="w-5 h-5" />
            <span>휴지통</span>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-auto p-4 border-t border-outline-variant/30 flex flex-col gap-1">
        <button 
          onClick={() => setShowAddFolderModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-outline text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:border-primary transition-all active:scale-95 text-sm font-semibold cursor-pointer"
        >
          <FolderPlus className="w-4.5 h-4.5 text-primary" />
          <span>새 폴더 추가</span>
        </button>
        
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-outline font-semibold">
          <button 
            onClick={() => alert("도움말: 이 앱은 태블릿 환경에 맞춰진 프리미엄 노팅 다이어리입니다.\n왼쪽 사이드바에서 노트 카테고리를 필터링하고, 달력을 클릭하여 특정 날짜에 노트를 기록해 보세요!")}
            className="flex items-center gap-1.5 py-1 px-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>도움말</span>
          </button>
          
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 py-1 px-1.5 hover:bg-surface-container-high rounded-lg text-primary"
            title="설정 및 테마 변경"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>설정</span>
          </button>

          <button 
            onClick={() => setScreen('SPLASH')}
            className="flex items-center gap-1.5 py-1 px-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant"
            title="스플래시 화면 다시 보기"
          >
            <span>스플래시</span>
          </button>
        </div>
      </div>

      {/* Add Folder Modal Popover */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in-scale">
          <form 
            onSubmit={handleCreateFolder}
            className="bg-white p-6 rounded-2xl w-80 shadow-2xl border border-outline-variant flex flex-col gap-4"
          >
            <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-primary" />
              <span>새 폴더 추가</span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              노트를 체계적으로 정리할 새로운 폴더 이름을 입력하세요.
            </p>
            <input
              type="text"
              autoFocus
              required
              placeholder="예: 아이디어, 영감, 미팅록"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full h-11 px-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
            <div className="flex items-center justify-end gap-2 text-sm font-semibold">
              <button
                type="button"
                onClick={() => {
                  setShowAddFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 hover:bg-surface-container-high rounded-xl text-on-surface-variant transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-soft"
              >
                생성
              </button>
            </div>
          </form>
        </div>
      )}
    </aside>
  );
}
