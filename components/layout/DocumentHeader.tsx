'use client';

import MMBBrandLogo from '@/components/branding/MMBBrandLogo';

interface DocumentHeaderProps {
  documentTitle?: string;
  documentNumber?: string;
}

export default function DocumentHeader({ documentTitle, documentNumber }: DocumentHeaderProps) {
  return (
    <>
      <div className="hidden print:block mb-6 border-b border-gray-300 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">MMB WORKSHOP</h1>
              <p className="text-xs text-gray-500 tracking-widest">SERVICE MANAGEMENT SYSTEM</p>
            </div>
          </div>
          {(documentTitle || documentNumber) && (
            <div className="text-right">
              {documentTitle && <p className="text-sm font-semibold text-gray-900">{documentTitle}</p>}
              {documentNumber && <p className="text-xs text-gray-500">{documentNumber}</p>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
