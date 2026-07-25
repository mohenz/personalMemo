import React from 'react';
import { Calendar, FileText, Folder } from 'lucide-react';

export type MobileTab = 'NOTES' | 'CALENDAR' | 'FILES';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
}

const TABS: Array<{ id: MobileTab; label: string; Icon: React.ElementType }> = [
  { id: 'NOTES', label: '메모', Icon: FileText },
  { id: 'CALENDAR', label: '캘린더', Icon: Calendar },
  { id: 'FILES', label: '파일', Icon: Folder },
];

export default function MobileBottomNav({ activeTab, onChangeTab }: MobileBottomNavProps) {
  return (
    <nav
      className="relative z-30 flex items-stretch border-t border-grid-line bg-background shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChangeTab(id)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-14 min-h-[44px] transition-colors ${
            activeTab === id ? 'text-primary' : 'text-on-surface-variant'
          }`}
          aria-current={activeTab === id}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[11px] font-semibold">{label}</span>
        </button>
      ))}
    </nav>
  );
}
