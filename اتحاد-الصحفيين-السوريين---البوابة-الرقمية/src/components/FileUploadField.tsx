import { useId, useState } from 'react';
import { FileText, Paperclip, Trash2, CheckCircle2 } from 'lucide-react';
import { fileToStoredAttachment, formatFileSize } from '../lib/storage';
import type { StoredAttachment } from '../types/union';

interface FileUploadFieldProps {
  label: string;
  required?: boolean;
  hint: string;
  accept?: string;
  value: StoredAttachment | null;
  onChange: (attachment: StoredAttachment | null) => void;
  error?: string;
}

export function FileUploadField({
  label,
  required = false,
  hint,
  accept = 'image/*,.pdf',
  value,
  onChange,
  error,
}: FileUploadFieldProps) {
  const inputId = useId();
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const stored = await fileToStoredAttachment(file);
      onChange(stored);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="block text-sm font-semibold text-[#1b2420]">
          {label} {required && <span className="text-[#CE1031]">*</span>}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#04935f]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            مرفق محفوظ
          </span>
        )}
      </div>

      <div
        className={`rounded-xl border transition-colors bg-[#f3f8f5] p-3.5 ${
          error
            ? 'border-[#CE1031]'
            : value
            ? 'border-[#04935f]/60'
            : 'border-[#e3e9e5] hover:border-[#04935f]/40'
        }`}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="sr-only"
        />

        {!value ? (
          <label
            htmlFor={inputId}
            className="flex items-center justify-between gap-3 cursor-pointer min-h-[44px]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#e6f2ec] flex items-center justify-center shrink-0 text-[#0f5a3c]">
                <Paperclip className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1b2420] truncate">
                  {loading ? 'جارٍ معالجة الملف...' : 'لم يتمّ اختيار أيّ ملفّ'}
                </p>
                <p className="text-xs text-[#5c6a63] truncate">{hint}</p>
              </div>
            </div>
            <span className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#e6f2ec] text-xs font-bold text-[#0f5a3c] border border-[#e3e9e5] whitespace-nowrap shrink-0 transition-colors">
              اختر ملفاً
            </span>
          </label>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {value.previewDataUrl ? (
                <img
                  src={value.previewDataUrl}
                  alt={value.name}
                  className="w-11 h-11 rounded-lg object-cover border border-[#e3e9e5] shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-[#e6f2ec] text-[#04935f] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1b2420] truncate">{value.name}</p>
                <p className="text-xs text-[#5c6a63] tabular-nums">
                  {formatFileSize(value.size)} · محفوظ في الذاكرة المحلية
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor={inputId}
                className="px-3 py-2 min-h-[40px] flex items-center rounded-lg bg-white hover:bg-[#e6f2ec] text-xs font-bold text-[#0f5a3c] border border-[#e3e9e5] cursor-pointer whitespace-nowrap"
              >
                تغيير
              </label>
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label={`إزالة ${label}`}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-[#fbecea] hover:bg-[#CE1031]/15 text-[#CE1031] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {value && <p className="text-xs text-[#5c6a63]">{hint}</p>}
      {error && <p className="text-xs font-semibold text-[#CE1031]">{error}</p>}
    </div>
  );
}
