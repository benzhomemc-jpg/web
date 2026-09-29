'use client';

import { Check, Save } from 'lucide-react';

interface MobileSaveBarProps {
  onSave: () => void | Promise<void>;
  label?: string;
  savedLabel?: string;
  saved?: boolean;
  disabled?: boolean;
  saving?: boolean;
  savingLabel?: string;
}

export default function MobileSaveBar({
  onSave,
  label = 'บันทึก',
  savedLabel = 'บันทึกแล้ว',
  saved = false,
  disabled = false,
  saving = false,
  savingLabel = 'กำลังบันทึก...',
}: MobileSaveBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl lg:hidden">
      <div className="mx-auto max-w-2xl px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={disabled || saving}
          className={`flex h-14 w-full items-center justify-center rounded-xl text-base font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 ${saved ? 'bg-green-600 shadow-green-600/10' : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/20'}`}
        >
          {saved ? <Check className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
          {saving ? savingLabel : saved ? savedLabel : label}
        </button>
      </div>
    </div>
  );
}
