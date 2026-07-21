import React, { useState } from 'react';
import { X, Sun, Moon, Check, User, Sparkles, Upload, Download, Smartphone, Cloud, LogOut } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  profileImage: string;
  onUpdateProfileImage: (file: File) => Promise<void>;
  darkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
  archiveUserEmail: string;
  archiveStatus: string;
  firebaseConfigured: boolean;
  onArchiveLogin: (email: string, password: string) => Promise<void>;
  onArchiveLogout: () => Promise<void>;
  onArchivePasswordReset: (email: string) => Promise<void>;
  isInstallable?: boolean;
  onInstall?: () => void;
}

export default function SettingsModal({
  onClose,
  profileImage,
  onUpdateProfileImage,
  darkMode,
  onToggleDarkMode,
  archiveUserEmail,
  archiveStatus,
  firebaseConfigured,
  onArchiveLogin,
  onArchiveLogout,
  onArchivePasswordReset,
  isInstallable,
  onInstall
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'archive' | 'theme'>('profile');
  const [dragOver, setDragOver] = useState(false);
  const [archiveEmail, setArchiveEmail] = useState('');
  const [archivePassword, setArchivePassword] = useState('');
  const [profileStatus, setProfileStatus] = useState('');

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileStatus('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setProfileStatus('프로필 이미지를 저장하는 중입니다.');
    try {
      await onUpdateProfileImage(file);
      setProfileStatus('프로필 이미지가 저장되었습니다.');
    } catch (error) {
      setProfileStatus(error instanceof Error ? error.message : '프로필 이미지 저장에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in-scale p-4">
      {/* Modal Card */}
      <div className="bg-white dark:bg-surface-container-low border border-outline-variant dark:border-outline/40 rounded-3xl w-[520px] max-w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <header className="px-6 py-5 border-b border-grid-line dark:border-outline/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl dark:bg-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-bold text-on-background">애플리케이션 설정</h2>
              <p className="font-sans text-xs text-on-surface-variant">나만의 맞춤형 디지털 노트 감성을 완성하세요</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-surface dark:hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Tab Selection */}
        <div className="flex border-b border-grid-line dark:border-outline/10 px-6 bg-surface-container-low dark:bg-surface-container-lowest shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <User className="w-4 h-4" />
            <span>프로필 이미지 변경</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`py-3.5 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'theme'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>화면 테마 설정</span>
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`py-3.5 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'archive'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>자료실 계정</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Current Profile Preview */}
              <div className="flex flex-col items-center gap-3 bg-surface dark:bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 text-center">
                <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">현재 프로필</span>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary shadow-soft bg-white">
                  <img 
                    src={profileImage} 
                    alt="Current profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-xs text-outline font-medium">상단 사이드바에 표시되는 프로필 사진입니다.</p>
              </div>

              {/* Custom Gallery Upload */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider block">
                  갤러리에서 이미지 업로드
                </span>
                
                <div 
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all bg-surface dark:bg-surface-container-lowest relative group ${
                    dragOver 
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[0.99]' 
                      : 'border-outline-variant/60 dark:border-outline/30 hover:border-primary/80'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    handleFileChange(file);
                  }}
                >
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleFileChange(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    title="갤러리 이미지 선택"
                  />
                  
                  <div className={`p-3 rounded-full transition-transform ${
                    dragOver ? 'bg-primary/20 text-primary scale-110' : 'bg-primary/10 text-primary dark:bg-primary/20 group-hover:scale-110'
                  }`}>
                    <Upload className="w-5 h-5" />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs font-bold text-on-background">클릭하거나 이미지를 드래그하여 업로드</p>
                    <p className="text-[11px] text-outline mt-1">PNG, JPG, GIF, WebP 지원 (최대 5MB 권장)</p>
                  </div>
                </div>
                {profileStatus && <p className="text-xs font-semibold text-primary">{profileStatus}</p>}
              </div>

            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-5">
              <span className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider block">
                화면 보기 모드 설정
              </span>
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Light Mode Card */}
                <button
                  onClick={() => onToggleDarkMode(false)}
                  className={`flex flex-col items-center justify-between p-6 rounded-2xl border-2 transition-all text-center gap-4 ${
                    !darkMode
                      ? 'border-primary bg-primary-container/20 ring-2 ring-primary/25 shadow-md'
                      : 'border-outline-variant/40 dark:border-outline/20 bg-slate-50 hover:border-primary text-slate-800'
                  }`}
                >
                  <div className={`p-4 rounded-full ${!darkMode ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'}`}>
                    <Sun className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">밝게보기</h3>
                    <p className="text-[11px] text-slate-500 mt-1">낮이나 조명이 있는 공간에서 추천</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    !darkMode ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {!darkMode && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>

                {/* Dark Mode Card */}
                <button
                  onClick={() => onToggleDarkMode(true)}
                  className={`flex flex-col items-center justify-between p-6 rounded-2xl border-2 transition-all text-center gap-4 ${
                    darkMode
                      ? 'border-primary bg-primary-container/20 ring-2 ring-primary/25 shadow-md'
                      : 'border-outline-variant/40 dark:border-outline/20 bg-slate-900 hover:border-primary text-slate-100'
                  }`}
                >
                  <div className={`p-4 rounded-full ${darkMode ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400'}`}>
                    <Moon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">어둡게 보기</h3>
                    <p className="text-[11px] text-slate-400 mt-1">밤이나 어두운 장소에서 눈 피로 방지</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    darkMode ? 'border-primary bg-primary text-white' : 'border-slate-600 bg-transparent'
                  }`}>
                    {darkMode && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>

              </div>

              {/* Dynamic notice describing dark theme features */}
              <div className="p-4 bg-surface dark:bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-xs text-on-surface-variant leading-relaxed">
                <span className="font-bold text-primary block mb-1">다크 모드</span>
                어둡게 보기를 켜면 종이 질감 격자 무늬의 농도와 선 색상이 어두운 밤하늘 테마에 맞춰 안전하게 조절됩니다.
              </div>

              {/* PWA Installation Card */}
              <div className="border-t border-grid-line dark:border-outline/10 pt-5 space-y-3">
                <span className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider block">
                  데스크톱/모바일 전용 앱(PWA) 설치
                </span>
                
                {isInstallable && onInstall ? (
                  <div className="flex items-center justify-between p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 gap-4 animate-fade-in-scale">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0 dark:bg-primary/20">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-on-background">MEMOry 앱 설치하기</h4>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">네트워크가 없어도 오프라인 상태에서 즉시 노트를 작성하고 기록하세요.</p>
                      </div>
                    </div>
                    <button
                      onClick={onInstall}
                      className="flex items-center gap-1.5 bg-primary text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-soft shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>앱 설치</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-surface dark:bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-xs text-on-surface-variant leading-relaxed">
                    <span className="font-bold text-primary block mb-1">설치 안내</span>
                    <p className="mb-2">브라우저의 주소창 오른쪽 <strong className="text-on-background">‘앱 설치’</strong> 버튼을 누르거나, iOS Safari의 경우 <strong className="text-on-background">‘공유하기’에서 ‘홈 화면에 추가’</strong>를 선택하면 독립 실행형으로 사용할 수 있습니다.</p>
                    <div className="text-[10px] text-outline font-semibold">오프라인 데이터 보존 / 태블릿 최적화 레이아웃 지원</div>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'archive' && (
            <div className="space-y-5">
              <div className="p-4 bg-surface dark:bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-xs text-on-surface-variant leading-relaxed">
                <span className="font-bold text-primary block mb-1">자료실 통합</span>
                같은 Firebase 계정으로 메모, 폴더, 테마, 첨부 이미지를 자료실 백엔드에 저장합니다.
              </div>

              {!firebaseConfigured && (
                <div className="p-4 rounded-2xl border border-error/30 bg-red-50 text-xs text-error font-semibold">
                  Firebase 환경변수가 설정되지 않았습니다. 자료실과 같은 `VITE_FIREBASE_*` 값을 personalMemo에 설정해야 합니다.
                </div>
              )}

              {archiveUserEmail ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-outline-variant/30 bg-surface p-4">
                    <span className="text-xs font-bold text-on-surface-variant block mb-1">현재 계정</span>
                    <strong className="text-sm text-on-background">{archiveUserEmail}</strong>
                    {archiveStatus && <p className="text-xs text-primary mt-2">{archiveStatus}</p>}
                  </div>
                  <button
                    onClick={onArchiveLogout}
                    className="w-full h-11 rounded-xl border border-outline-variant text-on-surface font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>MEMOry 로그아웃</span>
                  </button>
                </div>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    await onArchiveLogin(archiveEmail, archivePassword);
                    setArchivePassword('');
                  }}
                >
                  <label className="block text-xs font-bold text-on-surface-variant">
                    이메일
                    <input
                      value={archiveEmail}
                      onChange={(event) => setArchiveEmail(event.target.value)}
                      className="mt-1 w-full h-11 px-3 rounded-xl border border-outline-variant bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      type="email"
                      autoComplete="email"
                    />
                  </label>
                  <label className="block text-xs font-bold text-on-surface-variant">
                    비밀번호
                    <input
                      value={archivePassword}
                      onChange={(event) => setArchivePassword(event.target.value)}
                      className="mt-1 w-full h-11 px-3 rounded-xl border border-outline-variant bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      type="password"
                      autoComplete="current-password"
                    />
                  </label>
                  {archiveStatus && <p className="text-xs text-primary font-semibold">{archiveStatus}</p>}
                  <button
                    type="submit"
                    disabled={!firebaseConfigured || !archiveEmail.trim() || !archivePassword}
                    className="w-full h-11 rounded-xl bg-primary text-white font-bold disabled:opacity-40"
                  >
                    자료실 계정으로 로그인
                  </button>
                  <button
                    type="button"
                    disabled={!firebaseConfigured || !archiveEmail.trim()}
                    onClick={() => onArchivePasswordReset(archiveEmail)}
                    className="w-full h-10 rounded-xl text-primary font-bold hover:bg-primary/5 disabled:opacity-40"
                  >
                    비밀번호 재설정 메일 보내기
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="px-6 py-4 bg-surface-container-low dark:bg-surface-container-lowest border-t border-grid-line dark:border-outline/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-soft cursor-pointer"
          >
            확인 및 저장
          </button>
        </footer>

      </div>
    </div>
  );
}
