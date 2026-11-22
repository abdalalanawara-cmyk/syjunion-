import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  FileCheck,
  RotateCcw,
  Users,
} from 'lucide-react';
import { UNION_BRANCHES } from '../data/unionContent';
import {
  DEFAULT_INTL_CARD_DRAFT,
  generateId,
  generateReferenceNumber,
  loadIntlCardDraft,
  saveIntlCardDraft,
} from '../lib/storage';
import { FileUploadField } from './FileUploadField';
import { UnionLogo } from './UnionEmblem';
import type { AppSection, InternationalCardDraft, UnionTransaction } from '../types/union';

interface InternationalCardWizardProps {
  onSaveTransaction: (tx: UnionTransaction) => void;
  onNavigate: (section: AppSection) => void;
}

export function InternationalCardWizard({
  onSaveTransaction,
  onNavigate,
}: InternationalCardWizardProps) {
  const [draft, setDraft] = useState<InternationalCardDraft>(() => loadIntlCardDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedTx, setSubmittedTx] = useState<UnionTransaction | null>(null);

  function updateDraft(patch: Partial<InternationalCardDraft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    saveIntlCardDraft(next);
  }

  function validateStep(step: 1 | 2 | 3): boolean {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!draft.fullNameAr.trim()) nextErrors.fullNameAr = 'الاسم الكامل بالعربية مطلوب';
      if (!draft.fullNameEn.trim()) nextErrors.fullNameEn = 'الاسم الكامل بالإنجليزية مطلوب';
      if (!draft.birthDate.trim()) nextErrors.birthDate = 'تاريخ الميلاد مطلوب';
      if (!draft.nationality) nextErrors.nationality = 'يرجى تحديد الجنسية';
      if (!draft.phone.trim()) nextErrors.phone = 'رقم الهاتف مطلوب';
      if (!draft.email.trim() || !draft.email.includes('@')) {
        nextErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
      }
    }

    if (step === 2) {
      if (!draft.membershipNumber.trim()) nextErrors.membershipNumber = 'رقم العضوية في الاتحاد مطلوب';
      if (!draft.branch) nextErrors.branch = 'يرجى اختيار الفرع';
      if (!draft.requestType) nextErrors.requestType = 'يرجى تحديد نوع الطلب';
      if (!draft.mediaOrganization.trim()) nextErrors.mediaOrganization = 'المؤسسة الإعلامية مطلوبة';
      if (!draft.jobTitle.trim()) nextErrors.jobTitle = 'صفة العمل مطلوبة';
      if (!draft.experienceYears.trim()) nextErrors.experienceYears = 'سنوات الخبرة مطلوبة';
      if (
        (draft.requestType === 'تجديد' || draft.requestType === 'بدل ضائع أو تالف') &&
        !draft.previousCardNumber.trim()
      ) {
        nextErrors.previousCardNumber = 'رقم البطاقة الدولية السابقة مطلوب في حال التجديد أو البدل';
      }
    }

    if (step === 3) {
      if (!draft.personalPhoto) nextErrors.personalPhoto = 'الصورة الشخصية الحديثة مطلوبة';
      if (!draft.membershipCardPhoto) nextErrors.membershipCardPhoto = 'صورة بطاقة العضوية مطلوبة';
      if (!draft.idOrPassportPhoto) {
        nextErrors.idOrPassportPhoto = 'صورة الهوية الوطنية أو جواز السفر مطلوبة';
      }
      if (!draft.confirmProfessionalMember) {
        nextErrors.confirmProfessionalMember = 'يرجى تأكيد أنك صحفي محترف وعضو عامل (أساسي)';
      }
      if (!draft.confirmAccuracyAndContact) {
        nextErrors.confirmAccuracyAndContact = 'يرجى الإقرار بصحة المعلومات والموافقة على التواصل';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goToStep(targetStep: 1 | 2 | 3) {
    if (targetStep > draft.step) {
      if (!validateStep(draft.step)) return;
    }
    setErrors({});
    updateDraft({ step: targetStep });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok1 = validateStep(1);
    if (!ok1) {
      updateDraft({ step: 1 });
      return;
    }
    const ok2 = validateStep(2);
    if (!ok2) {
      updateDraft({ step: 2 });
      return;
    }
    const ok3 = validateStep(3);
    if (!ok3) return;

    const now = new Date().toISOString();
    const ref = generateReferenceNumber('IPC');
    const tx: UnionTransaction = {
      id: generateId(),
      referenceNumber: ref,
      type: 'international-card',
      title: `طلب بطاقة الصحافة الدولية (${draft.requestType})`,
      applicantName: draft.fullNameAr.trim(),
      branch: draft.branch,
      status: 'محفوظ محلياً',
      createdAt: now,
      updatedAt: now,
      summary: `${draft.fullNameEn.trim().toUpperCase()} · ${draft.jobTitle} في ${draft.mediaOrganization}`,
      payload: {
        الاسم_بالعربية: draft.fullNameAr.trim(),
        الاسم_بالإنجليزية: draft.fullNameEn.trim().toUpperCase(),
        تاريخ_الميلاد: draft.birthDate.trim(),
        الجنسية: draft.nationality,
        رقم_الهاتف: draft.phone.trim(),
        البريد_الإلكتروني: draft.email.trim(),
        رقم_العضوية: draft.membershipNumber.trim(),
        الفرع: draft.branch,
        نوع_الطلب: draft.requestType,
        المؤسسة_الإعلامية: draft.mediaOrganization.trim(),
        صفة_العمل: draft.jobTitle.trim(),
        سنوات_الخبرة: draft.experienceYears.trim(),
        رقم_البطاقة_السابقة: draft.previousCardNumber.trim() || 'لا ينطبق',
        صورة_شخصية: draft.personalPhoto,
        بطاقة_العضوية: draft.membershipCardPhoto,
        الهوية_أو_الجواز: draft.idOrPassportPhoto,
      },
    };

    onSaveTransaction(tx);
    setSubmittedTx(tx);
    setDraft(DEFAULT_INTL_CARD_DRAFT);
    saveIntlCardDraft(DEFAULT_INTL_CARD_DRAFT);
  }

  function handleResetDraft() {
    setErrors({});
    setDraft(DEFAULT_INTL_CARD_DRAFT);
    saveIntlCardDraft(DEFAULT_INTL_CARD_DRAFT);
  }

  if (submittedTx) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-[#0b3d2a] to-[#062a1e] sju-pattern-bg border border-[#c9a24a]/50 p-6 sm:p-8 space-y-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#04935f]/30 border border-[#e2c98a]/40 flex items-center justify-center shrink-0 text-[#e2c98a]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                تم تسجيل طلب بطاقة الصحافة الدولية وحفظه محلياً
              </h2>
              <p className="text-sm text-[#e6f2ec]">
                يدرس الاتحاد الطلب ويتواصل معك لاستكمال الإجراءات. جميع تفاصيل الطلب ومرفقاته محفوظة في ذاكرة جهازك.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-[#062a1e]/75 border border-white/15 p-4">
            <div>
              <p className="text-xs text-[#e6f2ec]/80">الرقم المرجعي</p>
              <p className="text-base font-extrabold text-[#c9a24a] tabular-nums">
                {submittedTx.referenceNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#e6f2ec]/80">مقدم الطلب</p>
              <p className="text-base font-bold text-white">{submittedTx.applicantName}</p>
            </div>
            <div>
              <p className="text-xs text-[#e6f2ec]/80">الفرع</p>
              <p className="text-base font-bold text-[#e2c98a]">{submittedTx.branch}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('vault')}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#c9a24a] hover:bg-[#e2c98a] text-[#062a1e] font-extrabold text-sm"
            >
              عرض المعاملة في سجل المعاملات
            </button>
            <button
              type="button"
              onClick={() => setSubmittedTx(null)}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20"
            >
              تقديم طلب جديد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold text-[#04935f]">طلب بطاقة الصحافة الدولية · العضوية</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b2420]">
              طلب بطاقة الصحافة الدولية
            </h1>
            <p className="text-sm sm:text-base text-[#5c6a63]">
              اتحاد الصحفيين في الجمهورية العربية السورية يمنح بطاقة الصحافة الدولية للصحفي المحترف (العامل / الأساسي).
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetDraft}
            className="min-h-[44px] px-3.5 py-2 rounded-lg bg-white hover:bg-[#f3f8f5] text-xs font-bold text-[#5c6a63] border border-[#e3e9e5] inline-flex items-center gap-2 self-start md:self-auto whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسح المسودة</span>
          </button>
        </div>
      </header>

      {/* 3 Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-[#e3e9e5] p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-[#04935f]">
            <Users className="w-4 h-4 shrink-0" />
            <h2 className="text-sm font-bold text-[#1b2420]">لمن تُمنح</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5c6a63] leading-relaxed">
            للصحفي المحترف العضو العامل (الأساسي) في الاتحاد
          </p>
        </div>

        <div className="rounded-xl bg-white border border-[#e3e9e5] p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-[#c9a24a]">
            <FileCheck className="w-4 h-4 shrink-0" />
            <h2 className="text-sm font-bold text-[#1b2420]">الوثائق المطلوبة</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5c6a63] leading-relaxed">
            صورة شخصية حديثة، بطاقة العضوية، الهوية أو جواز السفر
          </p>
        </div>

        <div className="rounded-xl bg-white border border-[#e3e9e5] p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-[#0f5a3c]">
            <BadgeCheck className="w-4 h-4 shrink-0" />
            <h2 className="text-sm font-bold text-[#1b2420]">المتابعة</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5c6a63] leading-relaxed">
            يدرس الاتحاد الطلب ويتواصل معك لاستكمال الإجراءات
          </p>
        </div>
      </div>

      {/* 3-Step Indicator */}
      <nav aria-label="خطوات طلب البطاقة الدولية" className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { num: 1 as const, label: 'البيانات الشخصية' },
          { num: 2 as const, label: 'العضوية والعمل' },
          { num: 3 as const, label: 'المرفقات والإرسال' },
        ].map((step) => {
          const isCurrent = draft.step === step.num;
          const isDone = draft.step > step.num;
          return (
            <button
              key={step.num}
              type="button"
              onClick={() => goToStep(step.num)}
              className={`min-h-[56px] rounded-xl p-3 border text-right transition-all flex items-center gap-2.5 ${
                isCurrent
                  ? 'bg-[#0b3d2a] border-[#062a1e] text-white shadow-sm'
                  : isDone
                  ? 'bg-[#e6f2ec] border-[#04935f]/35 text-[#062a1e]'
                  : 'bg-white border-[#e3e9e5] hover:bg-[#f3f8f5] text-[#1b2420]'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 tabular-nums ${
                  isCurrent
                    ? 'bg-[#c9a24a] text-[#062a1e]'
                    : isDone
                    ? 'bg-[#04935f] text-white'
                    : 'bg-[#f3f8f5] text-[#5c6a63]'
                }`}
              >
                {step.num}
              </span>
              <span className="text-xs sm:text-sm font-bold truncate">{step.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Form Container */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white border border-[#e3e9e5] p-5 sm:p-8 space-y-6"
        noValidate
      >
        {/* STEP 1 */}
        {draft.step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e3e9e5]">
              <span className="w-8 h-8 rounded-lg bg-[#062a1e] text-[#c9a24a] text-sm font-extrabold flex items-center justify-center tabular-nums">
                1
              </span>
              <h2 className="text-lg font-bold text-[#1b2420]">البيانات الشخصية</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  الاسم الكامل بالعربية <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="text"
                  value={draft.fullNameAr}
                  onChange={(e) => updateDraft({ fullNameAr: e.target.value })}
                  placeholder="الاسم الثلاثي"
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] placeholder:text-[#5c6a63]"
                />
                {errors.fullNameAr && <p className="text-xs text-[#CE1031] mt-1">{errors.fullNameAr}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  الاسم الكامل بالإنجليزية <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={draft.fullNameEn}
                  onChange={(e) => updateDraft({ fullNameEn: e.target.value })}
                  placeholder="كما يرد في جواز السفر"
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] placeholder:text-[#5c6a63] text-left"
                />
                <p className="text-xs text-[#04935f] font-semibold mt-1">
                  يُطبع على البطاقة كما هو مكتوب هنا
                  {draft.fullNameEn.trim() ? `: ${draft.fullNameEn.trim().toUpperCase()}` : ''}
                </p>
                {errors.fullNameEn && <p className="text-xs text-[#CE1031] mt-1">{errors.fullNameEn}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  تاريخ الميلاد <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="date"
                  value={draft.birthDate}
                  onChange={(e) => updateDraft({ birthDate: e.target.value })}
                  placeholder="يوم/شهر/سنة"
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] tabular-nums"
                />
                <p className="text-xs text-[#5c6a63] mt-1">يوم/شهر/سنة</p>
                {errors.birthDate && <p className="text-xs text-[#CE1031] mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <span className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  الجنسية <span className="text-[#CE1031]">*</span>
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(['سوري', 'فلسطيني سوري'] as const).map((nat) => {
                    const selected = draft.nationality === nat;
                    return (
                      <button
                        key={nat}
                        type="button"
                        onClick={() => updateDraft({ nationality: nat })}
                        className={`min-h-[44px] px-3 rounded-lg border text-sm font-bold transition-colors ${
                          selected
                            ? 'bg-[#0b3d2a] border-[#062a1e] text-[#e2c98a]'
                            : 'bg-[#f3f8f5] border-[#e3e9e5] text-[#1b2420] hover:border-[#04935f]/40'
                        }`}
                      >
                        {nat}
                      </button>
                    );
                  })}
                </div>
                {errors.nationality && <p className="text-xs text-[#CE1031] mt-1">{errors.nationality}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  رقم الهاتف <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={draft.phone}
                  onChange={(e) => updateDraft({ phone: e.target.value })}
                  placeholder="09xxxxxxxx أو رقم دولي"
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] placeholder:text-[#5c6a63] text-left tabular-nums"
                />
                {errors.phone && <p className="text-xs text-[#CE1031] mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  البريد الإلكتروني <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={draft.email}
                  onChange={(e) => updateDraft({ email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] placeholder:text-[#5c6a63] text-left"
                />
                {errors.email && <p className="text-xs text-[#CE1031] mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#e3e9e5]">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#04935f] hover:bg-[#0f5a3c] text-white font-bold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <span>التالي: بيانات العضوية والعمل</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {draft.step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e3e9e5]">
              <span className="w-8 h-8 rounded-lg bg-[#062a1e] text-[#c9a24a] text-sm font-extrabold flex items-center justify-center tabular-nums">
                2
              </span>
              <h2 className="text-lg font-bold text-[#1b2420]">بيانات العضوية والعمل الصحفي</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  رقم العضوية في الاتحاد <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="text"
                  value={draft.membershipNumber}
                  onChange={(e) => updateDraft({ membershipNumber: e.target.value })}
                  placeholder="رقم البطاقة النقابية"
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

              <div className="md:col-span-2">
                <span className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  نوع الطلب <span className="text-[#CE1031]">*</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['إصدار لأول مرة', 'تجديد', 'بدل ضائع أو تالف'] as const).map((reqType) => {
                    const selected = draft.requestType === reqType;
                    return (
                      <button
                        key={reqType}
                        type="button"
                        onClick={() => updateDraft({ requestType: reqType })}
                        className={`min-h-[44px] px-4 rounded-lg border text-sm font-bold transition-colors ${
                          selected
                            ? 'bg-[#0b3d2a] border-[#062a1e] text-[#e2c98a]'
                            : 'bg-[#f3f8f5] border-[#e3e9e5] text-[#1b2420] hover:border-[#04935f]/40'
                        }`}
                      >
                        {reqType}
                      </button>
                    );
                  })}
                </div>
                {errors.requestType && (
                  <p className="text-xs text-[#CE1031] mt-1">{errors.requestType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  المؤسسة الإعلامية التي تعمل بها <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="text"
                  value={draft.mediaOrganization}
                  onChange={(e) => updateDraft({ mediaOrganization: e.target.value })}
                  placeholder="اسم المؤسسة، أو «مستقل»"
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] placeholder:text-[#5c6a63]"
                />
                {errors.mediaOrganization && (
                  <p className="text-xs text-[#CE1031] mt-1">{errors.mediaOrganization}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  صفة العمل <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="text"
                  value={draft.jobTitle}
                  onChange={(e) => updateDraft({ jobTitle: e.target.value })}
                  placeholder="مثال: مراسل، محرر، مصور صحفي..."
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] placeholder:text-[#5c6a63]"
                />
                {errors.jobTitle && <p className="text-xs text-[#CE1031] mt-1">{errors.jobTitle}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  سنوات الخبرة في العمل الصحفي <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={draft.experienceYears}
                  onChange={(e) => updateDraft({ experienceYears: e.target.value })}
                  placeholder="عدد السنوات"
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] tabular-nums"
                />
                {errors.experienceYears && (
                  <p className="text-xs text-[#CE1031] mt-1">{errors.experienceYears}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  رقم البطاقة الدولية السابقة
                  {(draft.requestType === 'تجديد' || draft.requestType === 'بدل ضائع أو تالف') && (
                    <span className="text-[#CE1031]"> *</span>
                  )}
                </label>
                <input
                  type="text"
                  value={draft.previousCardNumber}
                  onChange={(e) => updateDraft({ previousCardNumber: e.target.value })}
                  placeholder="في حال التجديد أو البدل"
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] tabular-nums"
                />
                <p className="text-xs text-[#5c6a63] mt-1">في حال التجديد أو البدل</p>
                {errors.previousCardNumber && (
                  <p className="text-xs text-[#CE1031] mt-1">{errors.previousCardNumber}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e3e9e5]">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#f2f2ef] hover:bg-[#e3e9e5] text-[#1b2420] font-semibold text-sm inline-flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#04935f] hover:bg-[#0f5a3c] text-white font-bold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <span>التالي: المرفقات والإرسال</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {draft.step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e3e9e5]">
              <span className="w-8 h-8 rounded-lg bg-[#062a1e] text-[#c9a24a] text-sm font-extrabold flex items-center justify-center tabular-nums">
                3
              </span>
              <h2 className="text-lg font-bold text-[#1b2420]">المرفقات والإرسال</h2>
            </div>

            {/* Live Card Preview with Official UnionLogo */}
            <div className="rounded-xl bg-gradient-to-br from-[#0b3d2a] to-[#062a1e] sju-pattern-bg border border-[#c9a24a]/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
              <div className="space-y-1.5">
                <UnionLogo className="h-8 w-auto mb-1" />
                <p className="text-xs font-bold text-[#e2c98a]">معاينة الطباعة على البطاقة الدولية</p>
                <p className="text-base font-extrabold text-white">
                  {draft.fullNameAr || 'الاسم بالعربية'}
                </p>
                <p className="text-sm font-bold text-[#7bdcb5] tracking-wide" dir="ltr">
                  {(draft.fullNameEn || 'FULL NAME IN ENGLISH').toUpperCase()}
                </p>
                <p className="text-xs text-[#e6f2ec]/85">
                  {draft.jobTitle || 'صفة العمل'} · {draft.mediaOrganization || 'المؤسسة الإعلامية'} · عضوية رقم{' '}
                  <span className="tabular-nums">{draft.membershipNumber || '—'}</span>
                </p>
              </div>
              <CreditCard className="w-9 h-9 text-[#c9a24a] shrink-0 hidden sm:block" />
            </div>

            <div className="space-y-4">
              <FileUploadField
                label="صورة شخصية حديثة"
                required
                hint="بخلفية بيضاء وواضحة الملامح – JPG أو PNG"
                accept="image/png,image/jpeg,image/*"
                value={draft.personalPhoto}
                onChange={(attachment) => updateDraft({ personalPhoto: attachment })}
                error={errors.personalPhoto}
              />

              <FileUploadField
                label="صورة بطاقة العضوية"
                required
                hint="بطاقة سارية المفعول – صورة أو PDF"
                value={draft.membershipCardPhoto}
                onChange={(attachment) => updateDraft({ membershipCardPhoto: attachment })}
                error={errors.membershipCardPhoto}
              />

              <FileUploadField
                label="صورة الهوية الوطنية أو جواز السفر"
                required
                hint="صفحة البيانات الشخصية – صورة أو PDF"
                value={draft.idOrPassportPhoto}
                onChange={(attachment) => updateDraft({ idOrPassportPhoto: attachment })}
                error={errors.idOrPassportPhoto}
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-[#e3e9e5]">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f3f8f5] border border-[#e3e9e5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.confirmProfessionalMember}
                  onChange={(e) => updateDraft({ confirmProfessionalMember: e.target.checked })}
                  className="mt-1 w-5 h-5 accent-[#04935f] shrink-0"
                />
                <span className="text-sm text-[#1b2420] leading-relaxed">
                  أؤكد أنني صحفي محترف وعضو عامل (أساسي) في الاتحاد.
                </span>
              </label>
              {errors.confirmProfessionalMember && (
                <p className="text-xs font-semibold text-[#CE1031]">{errors.confirmProfessionalMember}</p>
              )}

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f3f8f5] border border-[#e3e9e5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.confirmAccuracyAndContact}
                  onChange={(e) => updateDraft({ confirmAccuracyAndContact: e.target.checked })}
                  className="mt-1 w-5 h-5 accent-[#04935f] shrink-0"
                />
                <span className="text-sm text-[#1b2420] leading-relaxed">
                  أقرّ بصحة المعلومات والوثائق المقدّمة، وأوافق على تواصل الاتحاد معي بخصوص الطلب.
                </span>
              </label>
              {errors.confirmAccuracyAndContact && (
                <p className="text-xs font-semibold text-[#CE1031]">{errors.confirmAccuracyAndContact}</p>
              )}
            </div>

            <p className="text-xs text-[#5c6a63]">
              يدرس الاتحاد الطلب ويتواصل معك لاستكمال الإجراءات.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e3e9e5]">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#f2f2ef] hover:bg-[#e3e9e5] text-[#1b2420] font-semibold text-sm inline-flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
              <button
                type="submit"
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#04935f] hover:bg-[#0f5a3c] text-white font-bold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إرسال الطلب وحفظه محلياً</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
