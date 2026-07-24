import React from 'react';
import { FileText, Folder } from 'lucide-react';

export type MobileTab = 'NOTES' | 'FILES';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
}

export default function MobileBottomNav({ activeTab, onChangeTab }: MobileBottomNavProps) {
  return (
    <nav
      className="flex items-stretch border-t border-grid-line bg-background shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <button
        type="button"
        onClick={() => onChangeTab('NOTES')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 h-14 min-h-[44px] transition-colors ${
          activeTab === 'NOTES' ? 'text-primary' : 'text-on-surface-variant'
        }`}
        aria-current={activeTab === 'NOTES'}
      >
        <FileText className="w-5 h-5" />
        <span className="text-[11px] font-semibold">메모</span>
      </button>
      <button
        type="button"
        onClick={() => onChangeTab('FILES')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 h-14 min-h-[44px] transition-colors ${
          activeTab === 'FILES' ? 'text-primary' : 'text-on-surface-variant'
        }`}
        aria-current={activeTab === 'FILES'}
      >
        <Folder className="w-5 h-5" />
        <span className="text-[11px] font-semibold">파일</span>
      </button>
    </nav>
  );
}
