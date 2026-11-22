import { useState } from 'react';
import { ArrowLeft, CheckCircle2, FileCheck2, Scale } from 'lucide-react';
import { TRANSFER_ARTICLES, UNION_BRANCHES } from '../data/unionContent';
import {
  DEFAULT_TRANSFER_DRAFT,
  generateId,
  generateReferenceNumber,
  loadTransferDraft,
  saveTransferDraft,
} from '../lib/storage';
import { FileUploadField } from './FileUploadField';
import type { AppSection, MembershipTransferDraft, UnionTransaction } from '../types/union';

interface MembershipTransferViewProps {
  onSaveTransaction: (tx: UnionTransaction) => void;
  onNavigate: (section: AppSection) => void;
}

export function MembershipTransferView({
  onSaveTransaction,
  onNavigate,
}: MembershipTransferViewProps) {
  const [activeArticleId, setActiveArticleId] = useState<string>(TRANSFER_ARTICLES[0].id);
  const [draft, setDraft] = useState<MembershipTransferDraft>(() => loadTransferDraft());
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const activeArticle =
    TRANSFER_ARTICLES.find((a) => a.id === activeArticleId) ?? TRANSFER_ARTICLES[0];

  function updateDraft(patch: Partial<MembershipTransferDraft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    saveTransferDraft(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!draft.fullName.trim()) nextErrors.fullName = 'الاسم الكامل مطلوب';
    if (!draft.membershipNumber.trim()) nextErrors.membershipNumber = 'رقم عضوية التمرين مطلوب';
    if (!draft.branch) nextErrors.branch = 'يرجى تحديد الفرع';
    if (!draft.trainingStartDate) nextErrors.trainingStartDate = 'يرجى تحديد تاريخ بدء التمرين';
    if (!draft.examPassDate) nextErrors.examPassDate = 'يرجى تحديد تاريخ اجتياز الاختبار';
    if (!draft.membershipCardPhoto) nextErrors.membershipCardPhoto = 'صورة بطاقة العضوية مطلوبة';
    if (!draft.trainingProofDoc) nextErrors.trainingProofDoc = 'إثبات إتمام فترة التمرين مطلوب';
    if (!draft.recentPhoto) nextErrors.recentPhoto = 'الصورة الشخصية الحديثة مطلوبة';
    if (!draft.confirmCompleted) nextErrors.confirmCompleted = 'يرجى تأكيد إتمام التمرين واجتياز الاختبار';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const now = new Date().toISOString();
    const ref = generateReferenceNumber('TRF');
    const tx: UnionTransaction = {
      id: generateId(),
      referenceNumber: ref,
      type: 'membership-transfer',
      title: 'طلب تعديل العضوية (النقل إلى جدول الأعضاء العاملين)',
      applicantName: draft.fullName.trim(),
      branch: draft.branch,
      status: 'محفوظ محلياً',
      createdAt: now,
      updatedAt: now,
      summary: `رقم العضوية: ${draft.membershipNumber} · اجتياز الاختبار: ${draft.examPassDate}`,
      payload: {
        الاسم_الكامل: draft.fullName.trim(),
        رقم_العضوية: draft.membershipNumber.trim(),
        الفرع: draft.branch,
        تاريخ_بدء_التمرين: draft.trainingStartDate,
        تاريخ_اجتياز_الاختبار: draft.examPassDate,
        المؤسسة_الإعلامية: draft.mediaOrganization || 'غير محدد',
        الهاتف: draft.phone || 'غير محدد',
        صورة_بطاقة_العضوية: draft.membershipCardPhoto,
        إثبات_إتمام_التمرين: draft.trainingProofDoc,
        صورة_شخصية_حديثة: draft.recentPhoto,
        ملاحظات: draft.notes || 'لا توجد',
      },
    };

    onSaveTransaction(tx);
    setDraft(DEFAULT_TRANSFER_DRAFT);
    saveTransferDraft(DEFAULT_TRANSFER_DRAFT);
    setSubmittedRef(ref);
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold text-[#04935f]">تعديل العضوية · العضوية</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b2420]">
              تعديل العضوية — النقل إلى جدول الأعضاء العاملين
            </h1>
            <p className="text-sm sm:text-base text-[#5c6a63]">
              بحسب المادتين (12، 13) من قانون اتحاد الصحفيين
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('international-card')}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-white hover:bg-[#e6f2ec] text-sm font-bold text-[#0b3d2a] border border-[#e3e9e5] inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            <span>طلب بطاقة الصحافة الدولية</span>
            <ArrowLeft className="w-4 h-4 text-[#04935f]" />
          </button>
        </div>
      </header>

      {/* Articles 12 & 13 Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="tablist" aria-label="مواد النقل إلى جدول الأعضاء العاملين">
        {TRANSFER_ARTICLES.map((article) => {
          const isActive = article.id === activeArticle.id;
          return (
            <button
              key={article.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveArticleId(article.id)}
              className={`min-h-[64px] rounded-xl p-4 text-right border transition-all ${
                isActive
                  ? 'bg-[#0b3d2a] border-[#062a1e] text-white shadow-sm'
                  : 'bg-white border-[#e3e9e5] hover:bg-[#f3f8f5] text-[#1b2420]'
              }`}
            >
              <p className={`text-sm font-bold ${isActive ? 'text-[#e2c98a]' : 'text-[#04935f]'}`}>
                {article.tabTitle}
              </p>
              <p className={`text-xs mt-0.5 ${isActive ? 'text-[#e6f2ec]' : 'text-[#5c6a63]'}`}>
                {article.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Legal Text Card */}
      <section className="rounded-2xl bg-white border border-[#e3e9e5] p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#e3e9e5]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#062a1e] border border-[#c9a24a]/50 flex flex-col items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-[#e6f2ec]">المادة</span>
              <span className="text-xl font-extrabold text-[#c9a24a] tabular-nums leading-none">
                {activeArticle.number}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1b2420]">{activeArticle.subtitle}</h2>
              <p className="text-xs text-[#5c6a63]">قانون اتحاد الصحفيين — النقل والخدمة الصحافية</p>
            </div>
          </div>
          <Scale className="w-5 h-5 text-[#04935f] hidden sm:block" />
        </div>

        <div className="space-y-3">
          {activeArticle.paragraphs?.map((para, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#f3f8f5] border border-[#e3e9e5] p-4 flex items-start gap-3.5"
            >
              {para.label && (
                <span className="w-8 h-8 rounded-lg bg-[#062a1e] text-[#e2c98a] text-sm font-extrabold flex items-center justify-center shrink-0">
                  {para.label}
                </span>
              )}
              <p className="text-sm sm:text-base text-[#1b2420] leading-relaxed">{para.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Callout CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-[#0b3d2a] to-[#062a1e] sju-pattern-bg border border-[#c9a24a]/40 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 text-white">
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-xl font-bold text-white">هل أتممت فترة التمرين واجتزت الاختبار؟</h3>
          <p className="text-sm text-[#e6f2ec]/90 leading-relaxed">
            قدّم طلب نقل اسمك إلى جدول الأعضاء العاملين، وأرفق: صورة بطاقة العضوية، إثبات إتمام فترة التمرين، وصورة شخصية حديثة.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSubmittedRef(null);
            setShowForm((prev) => !prev);
          }}
          className="min-h-[48px] px-6 py-3 rounded-xl bg-[#c9a24a] hover:bg-[#e2c98a] text-[#062a1e] font-extrabold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>{showForm ? 'إخفاء نموذج الطلب' : 'تقديم طلب تعديل العضوية'}</span>
        </button>
      </section>

      {submittedRef && (
        <div
          role="status"
          className="rounded-2xl bg-[#e6f2ec] border border-[#04935f]/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#04935f] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-base font-bold text-[#062a1e]">
                تم حفظ طلب تعديل العضوية في الذاكرة المحلية بنجاح
              </p>
              <p className="text-sm text-[#1b2420] tabular-nums">
                رقم المعاملة المرجعي: <span className="font-extrabold text-[#04935f]">{submittedRef}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('vault')}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-[#0b3d2a] text-white text-sm font-bold whitespace-nowrap shrink-0"
          >
            استعراض سجل المعاملات
          </button>
        </div>
      )}

      {/* Interactive Transfer Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white border border-[#e3e9e5] p-6 sm:p-8 space-y-6"
          noValidate
        >
          <div className="pb-4 border-b border-[#e3e9e5]">
            <h3 className="text-lg font-bold text-[#1b2420]">
              نموذج طلب النقل إلى جدول الأعضاء العاملين
            </h3>
            <p className="text-xs text-[#5c6a63]">
              تحفظ جميع الحقول تلقائياً كمسودة في الذاكرة المحلية أثناء الكتابة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                الاسم الكامل <span className="text-[#CE1031]">*</span>
              </label>
              <input
                type="text"
                value={draft.fullName}
                onChange={(e) => updateDraft({ fullName: e.target.value })}
                placeholder="الاسم الثلاثي"
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420]"
              />
              {errors.fullName && <p className="text-xs text-[#CE1031] mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                رقم العضوية (فترة التمرين) <span className="text-[#CE1031]">*</span>
              </label>
              <input
                type="text"
                value={draft.membershipNumber}
                onChange={(e) => updateDraft({ membershipNumber: e.target.value })}
                placeholder="مثال: T-4589"
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] tabular-nums"
              />
              {errors.membershipNumber && (
                <p className="text-xs text-[#CE1031] mt-1">{errors.membershipNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                الفرع <span className="text-[#CE1031]">*</span>
              </label>
              <select
                value={draft.branch}
                onChange={(e) => updateDraft({ branch: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420]"
              >
                <option value="">— الرجاء تحديد اختيار —</option>
                {UNION_BRANCHES.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.branch && <p className="text-xs text-[#CE1031] mt-1">{errors.branch}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                المؤسسة الإعلامية التي تعمل بها
              </label>
              <input
                type="text"
                value={draft.mediaOrganization}
                onChange={(e) => updateDraft({ mediaOrganization: e.target.value })}
                placeholder="اسم المؤسسة أو مستقل"
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                تاريخ بدء التمرين <span className="text-[#CE1031]">*</span>
              </label>
              <input
                type="date"
                value={draft.trainingStartDate}
                onChange={(e) => updateDraft({ trainingStartDate: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] tabular-nums"
              />
              {errors.trainingStartDate && (
                <p className="text-xs text-[#CE1031] mt-1">{errors.trainingStartDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                تاريخ اجتياز اختبار التمرين <span className="text-[#CE1031]">*</span>
              </label>
              <input
                type="date"
                value={draft.examPassDate}
                onChange={(e) => updateDraft({ examPassDate: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] tabular-nums"
              />
              {errors.examPassDate && (
                <p className="text-xs text-[#CE1031] mt-1">{errors.examPassDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-[#e3e9e5]">
            <h4 className="text-base font-bold text-[#1b2420]">الوثائق المطلوبة للطلب</h4>
            <div className="grid grid-cols-1 gap-4">
              <FileUploadField
                label="صورة بطاقة العضوية"
                required
                hint="بطاقة التمرين سارية المفعول – صورة أو PDF"
                value={draft.membershipCardPhoto}
                onChange={(attachment) => updateDraft({ membershipCardPhoto: attachment })}
                error={errors.membershipCardPhoto}
              />
              <FileUploadField
                label="إثبات إتمام فترة التمرين واجتياز الاختبار"
                required
                hint="وثيقة مصدقة من الفرع أو لجنة القيد – صورة أو PDF"
                value={draft.trainingProofDoc}
                onChange={(attachment) => updateDraft({ trainingProofDoc: attachment })}
                error={errors.trainingProofDoc}
              />
              <FileUploadField
                label="صورة شخصية حديثة"
                required
                hint="بخلفية بيضاء وواضحة الملامح – JPG أو PNG"
                accept="image/*"
                value={draft.recentPhoto}
                onChange={(attachment) => updateDraft({ recentPhoto: attachment })}
                error={errors.recentPhoto}
              />
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 rounded-xl bg-[#f3f8f5] border border-[#e3e9e5] cursor-pointer">
            <input
              type="checkbox"
              checked={draft.confirmCompleted}
              onChange={(e) => updateDraft({ confirmCompleted: e.target.checked })}
              className="mt-1 w-5 h-5 accent-[#04935f] shrink-0"
            />
            <span className="text-sm text-[#1b2420] leading-relaxed">
              أؤكد إتمامي لفترة التمرين القانونية واجتيازي اختبار التمرين بنجاح، وأطلب نقل اسمي إلى جدول الأعضاء العاملين واحتساب مدة التمرين في خدمتي الصحافية وفق المادتين (12 و13).
            </span>
          </label>
          {errors.confirmCompleted && (
            <p className="text-xs font-semibold text-[#CE1031]">{errors.confirmCompleted}</p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#f2f2ef] hover:bg-[#e3e9e5] text-sm font-semibold text-[#1b2420]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[#04935f] hover:bg-[#0f5a3c] text-white font-bold text-sm transition-colors"
            >
              إرسال وحفظ طلب تعديل العضوية
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
