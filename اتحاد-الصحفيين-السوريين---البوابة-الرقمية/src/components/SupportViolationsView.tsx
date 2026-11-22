import { useState } from 'react';
import {
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquareWarning,
  ShieldAlert,
} from 'lucide-react';
import { UNION_BRANCHES, UNION_CENTERS } from '../data/unionContent';
import {
  DEFAULT_COMPLAINT_DRAFT,
  DEFAULT_CONTACT_DRAFT,
  DEFAULT_VIOLATION_DRAFT,
  generateId,
  generateReferenceNumber,
  loadComplaintDraft,
  loadContactDraft,
  loadViolationDraft,
  saveComplaintDraft,
  saveContactDraft,
  saveViolationDraft,
} from '../lib/storage';
import { FileUploadField } from './FileUploadField';
import type {
  AppSection,
  ComplaintDraft,
  ContactDraft,
  UnionTransaction,
  ViolationReportDraft,
} from '../types/union';

interface SupportViolationsViewProps {
  onSaveTransaction: (tx: UnionTransaction) => void;
  onNavigate: (section: AppSection) => void;
}

type SupportTab = 'violation' | 'complaint' | 'contact';

export function SupportViolationsView({
  onSaveTransaction,
  onNavigate,
}: SupportViolationsViewProps) {
  const [activeTab, setActiveTab] = useState<SupportTab>('violation');
  const [violation, setViolation] = useState<ViolationReportDraft>(() => loadViolationDraft());
  const [complaint, setComplaint] = useState<ComplaintDraft>(() => loadComplaintDraft());
  const [contact, setContact] = useState<ContactDraft>(() => loadContactDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  function updateViolation(patch: Partial<ViolationReportDraft>) {
    const next = { ...violation, ...patch };
    setViolation(next);
    saveViolationDraft(next);
  }

  function updateComplaint(patch: Partial<ComplaintDraft>) {
    const next = { ...complaint, ...patch };
    setComplaint(next);
    saveComplaintDraft(next);
  }

  function updateContact(patch: Partial<ContactDraft>) {
    const next = { ...contact, ...patch };
    setContact(next);
    saveContactDraft(next);
  }

  function handleViolationSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!violation.journalistName.trim()) nextErrors.journalistName = 'اسم الصحفي المتضرر مطلوب';
    if (!violation.governorate) nextErrors.governorate = 'يرجى تحديد المحافظة';
    if (!violation.incidentDate) nextErrors.incidentDate = 'تاريخ الواقعة مطلوب';
    if (!violation.violationType) nextErrors.violationType = 'يرجى تحديد نوع الانتهاك';
    if (!violation.description.trim()) nextErrors.description = 'وصف الواقعة مطلوب';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const now = new Date().toISOString();
    const ref = generateReferenceNumber('VIO');
    const tx: UnionTransaction = {
      id: generateId(),
      referenceNumber: ref,
      type: 'violation-report',
      title: `الإبلاغ عن انتهاك: ${violation.violationType}`,
      applicantName: violation.reporterName.trim() || violation.journalistName.trim(),
      branch: violation.governorate,
      status: 'قيد المتابعة',
      createdAt: now,
      updatedAt: now,
      summary: `الصحفي: ${violation.journalistName} · تاريخ الواقعة: ${violation.incidentDate}`,
      payload: {
        اسم_المُبلّغ: violation.reporterName || 'غير معلن',
        هاتف_التواصل: violation.phone || 'غير مرفق',
        الصحفي_المعني: violation.journalistName.trim(),
        المحافظة: violation.governorate,
        تاريخ_الواقعة: violation.incidentDate,
        نوع_الانتهاك: violation.violationType,
        الجهة_الإعلامية: violation.mediaEntity || 'غير محدد',
        سرية_الهوية: violation.confidential ? 'نعم' : 'لا',
        تفاصيل_الانتهاك: violation.description.trim(),
        وثيقة_داعمة: violation.evidenceFile,
      },
    };
    onSaveTransaction(tx);
    setViolation(DEFAULT_VIOLATION_DRAFT);
    saveViolationDraft(DEFAULT_VIOLATION_DRAFT);
    setSubmittedRef(ref);
  }

  function handleComplaintSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!complaint.complainantName.trim()) nextErrors.complainantName = 'الاسم الكامل مطلوب';
    if (!complaint.phone.trim()) nextErrors.phone = 'رقم الهاتف مطلوب';
    if (!complaint.complaintCategory) nextErrors.complaintCategory = 'يرجى تحديد تصنيف الشكوى';
    if (!complaint.details.trim()) nextErrors.details = 'تفاصيل الشكوى مطلوبة';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const now = new Date().toISOString();
    const ref = generateReferenceNumber('CMP');
    const tx: UnionTransaction = {
      id: generateId(),
      referenceNumber: ref,
      type: 'complaint',
      title: `شكوى مهنية: ${complaint.complaintCategory}`,
      applicantName: complaint.complainantName.trim(),
      branch: complaint.branch || 'المقر المركزي - دمشق',
      status: 'محفوظ محلياً',
      createdAt: now,
      updatedAt: now,
      summary: `الجهة المعنية: ${complaint.targetEntity || 'غير محددة'}`,
      payload: {
        مقدم_الشكوى: complaint.complainantName.trim(),
        رقم_العضوية: complaint.membershipNumber || 'غير مرفق',
        الهاتف: complaint.phone.trim(),
        الفرع: complaint.branch || 'دمشق',
        التصنيف: complaint.complaintCategory,
        الجهة_المشكو_منها: complaint.targetEntity || 'غير محدد',
        التفاصيل: complaint.details.trim(),
        مرفق: complaint.attachment,
      },
    };
    onSaveTransaction(tx);
    setComplaint(DEFAULT_COMPLAINT_DRAFT);
    saveComplaintDraft(DEFAULT_COMPLAINT_DRAFT);
    setSubmittedRef(ref);
  }

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!contact.senderName.trim()) nextErrors.senderName = 'الاسم مطلوب';
    if (!contact.phone.trim() && !contact.email.trim()) {
      nextErrors.phone = 'يرجى إدخال رقم هاتف أو بريد إلكتروني';
    }
    if (!contact.subject.trim()) nextErrors.subject = 'موضوع الرسالة مطلوب';
    if (!contact.message.trim()) nextErrors.message = 'نص الرسالة مطلوب';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const now = new Date().toISOString();
    const ref = generateReferenceNumber('MSG');
    const tx: UnionTransaction = {
      id: generateId(),
      referenceNumber: ref,
      type: 'contact',
      title: `مراسلة: ${contact.subject.trim()}`,
      applicantName: contact.senderName.trim(),
      branch: contact.targetCenter,
      status: 'محفوظ محلياً',
      createdAt: now,
      updatedAt: now,
      summary: contact.message.trim().slice(0, 90),
      payload: {
        المرسل: contact.senderName.trim(),
        البريد: contact.email || 'غير مرفق',
        الهاتف: contact.phone || 'غير مرفق',
        المركز_المستهدف: contact.targetCenter,
        الموضوع: contact.subject.trim(),
        الرسالة: contact.message.trim(),
      },
    };
    onSaveTransaction(tx);
    setContact(DEFAULT_CONTACT_DRAFT);
    saveContactDraft(DEFAULT_CONTACT_DRAFT);
    setSubmittedRef(ref);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold text-[#04935f]">
          تواصل مع الاتحاد · المقر المركزي دمشق
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b2420]">
          نحن هنا لخدمة الصحفيين والصحفيات
        </h1>
        <p className="text-sm sm:text-base text-[#5c6a63]">
          توثيق الانتهاكات بحق الصحفيين، تقديم شكاوى العمل الإعلامي والصحفي، أو مراسلة المقر المركزي ومراكز الاتحاد.
        </p>
      </header>

      {/* HQ & Quick Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setErrors({});
            setSubmittedRef(null);
            setActiveTab('violation');
          }}
          className={`min-h-[72px] p-4 rounded-xl border text-right transition-all ${
            activeTab === 'violation'
              ? 'bg-[#fbecea] border-[#CE1031]/50'
              : 'bg-white border-[#e3e9e5] hover:bg-[#f3f8f5]'
          }`}
        >
          <div className="flex items-center gap-2 text-[#CE1031]">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold text-[#1b2420]">الإبلاغ عن انتهاك</span>
          </div>
          <p className="text-xs text-[#5c6a63] mt-1">توثيق الانتهاكات بحق الصحفيين</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setErrors({});
            setSubmittedRef(null);
            setActiveTab('complaint');
          }}
          className={`min-h-[72px] p-4 rounded-xl border text-right transition-all ${
            activeTab === 'complaint'
              ? 'bg-[#fdf8eb] border-[#c9a24a]'
              : 'bg-white border-[#e3e9e5] hover:bg-[#f3f8f5]'
          }`}
        >
          <div className="flex items-center gap-2 text-[#9b7622]">
            <MessageSquareWarning className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold text-[#1b2420]">تقديم شكوى</span>
          </div>
          <p className="text-xs text-[#5c6a63] mt-1">شكاوى العمل الإعلامي والصحفي</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setErrors({});
            setSubmittedRef(null);
            setActiveTab('contact');
          }}
          className={`min-h-[72px] p-4 rounded-xl border text-right transition-all ${
            activeTab === 'contact'
              ? 'bg-[#e6f2ec] border-[#04935f]/60'
              : 'bg-white border-[#e3e9e5] hover:bg-[#f3f8f5]'
          }`}
        >
          <div className="flex items-center gap-2 text-[#04935f]">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold text-[#1b2420]">راسلنا</span>
          </div>
          <p className="text-xs text-[#5c6a63] mt-1">نموذج التواصل المباشر</p>
        </button>

        <div className="min-h-[72px] p-4 rounded-xl border border-[#062a1e] bg-[#0b3d2a] text-white flex flex-col justify-center">
          <div className="flex items-center gap-2 text-[#e2c98a]">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold">المقر المركزي</span>
          </div>
          <p className="text-xs text-[#e6f2ec] mt-1">دمشق · ساحة المحافظة</p>
        </div>
      </div>

      {submittedRef && (
        <div
          role="status"
          className="rounded-xl bg-[#e6f2ec] border border-[#04935f]/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 text-sm font-bold text-[#062a1e]">
            <CheckCircle2 className="w-5 h-5 text-[#04935f] shrink-0" />
            <span>
              تم توثيق المعاملة وحفظها في الذاكرة المحلية برقم مرجعي{' '}
              <span className="text-[#04935f] tabular-nums">{submittedRef}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('vault')}
            className="text-xs font-bold text-[#04935f] underline whitespace-nowrap"
          >
            عرض في سجل المعاملات
          </button>
        </div>
      )}

      {/* FORM: VIOLATION REPORT */}
      {activeTab === 'violation' && (
        <form
          onSubmit={handleViolationSubmit}
          className="rounded-2xl bg-white border border-[#e3e9e5] p-6 sm:p-8 space-y-5"
          noValidate
        >
          <div className="pb-3 border-b border-[#e3e9e5]">
            <h2 className="text-lg font-bold text-[#1b2420]">توثيق الانتهاكات بحق الصحفيين</h2>
            <p className="text-xs text-[#5c6a63]">
              تُحفظ بيانات البلاغ محلياً مع خيار السرية التامة حتى تتم مراجعته ومتابعته من مركز الدعم القانوني.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                اسم الصحفي المتضرر <span className="text-[#CE1031]">*</span>
              </label>
              <input
                type="text"
                value={violation.journalistName}
                onChange={(e) => updateViolation({ journalistName: e.target.value })}
                placeholder="الاسم الكامل للصحفي"
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
              />
              {errors.journalistName && (
                <p className="text-xs text-[#CE1031] mt-1">{errors.journalistName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                نوع الانتهاك <span className="text-[#CE1031]">*</span>
              </label>
              <select
                value={violation.violationType}
                onChange={(e) => updateViolation({ violationType: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
              >
                <option value="">— الرجاء تحديد اختيار —</option>
                <option value="منع من التغطية أو سحب اعتماد">منع من التغطية أو سحب اعتماد</option>
                <option value="اعتداء جسدي أو احتجاز أثناء العمل">اعتداء جسدي أو احتجاز أثناء العمل</option>
                <option value="تهديد أو ترهيب مهني">تهديد أو ترهيب مهني</option>
                <option value="مصادرة معدات أو إتلاف مواد صحفية">مصادرة معدات أو إتلاف مواد صحفية</option>
                <option value="تضييق رقمي أو حجب تعسفي">تضييق رقمي أو حجب تعسفي</option>
              </select>
              {errors.violationType && (
                <p className="text-xs text-[#CE1031] mt-1">{errors.violationType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                المحافظة / الموقع <span className="text-[#CE1031]">*</span>
              </label>
              <select
                value={violation.governorate}
                onChange={(e) => updateViolation({ governorate: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
              >
                <option value="">— اختر المحافظة —</option>
                {UNION_BRANCHES.map((b) => (
                  <option key={b.id} value={b.city}>
                    {b.city}
                  </option>
                ))}
              </select>
              {errors.governorate && (
                <p className="text-xs text-[#CE1031] mt-1">{errors.governorate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                تاريخ الواقعة <span className="text-[#CE1031]">*</span>
              </label>
              <input
                type="date"
                value={violation.incidentDate}
                onChange={(e) => updateViolation({ incidentDate: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420] tabular-nums"
              />
              {errors.incidentDate && (
                <p className="text-xs text-[#CE1031] mt-1">{errors.incidentDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                اسم المُبلّغ (اختياري)
              </label>
              <input
                type="text"
                value={violation.reporterName}
                onChange={(e) => updateViolation({ reporterName: e.target.value })}
                placeholder="إن كان مختلفاً عن الصحفي"
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                رقم الهاتف للتواصل
              </label>
              <input
                type="tel"
                value={violation.phone}
                onChange={(e) => updateViolation({ phone: e.target.value })}
                placeholder="09xxxxxxxx"
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420] tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
              تفاصيل الواقعة والتوثيق <span className="text-[#CE1031]">*</span>
            </label>
            <textarea
              rows={4}
              value={violation.description}
              onChange={(e) => updateViolation({ description: e.target.value })}
              placeholder="يرجى وصف الحادثة، الزمان، المكان، وأي شهود أو جهات ذات صلة..."
              className="w-full p-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
            />
            {errors.description && (
              <p className="text-xs text-[#CE1031] mt-1">{errors.description}</p>
            )}
          </div>

          <FileUploadField
            label="مرفق أو دليل توثيقي (اختياري)"
            hint="صورة أو محضر أو ملف PDF"
            value={violation.evidenceFile}
            onChange={(attachment) => updateViolation({ evidenceFile: attachment })}
          />

          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#f3f8f5] border border-[#e3e9e5] cursor-pointer">
            <input
              type="checkbox"
              checked={violation.confidential}
              onChange={(e) => updateViolation({ confidential: e.target.checked })}
              className="w-5 h-5 accent-[#04935f]"
            />
            <span className="text-sm text-[#1b2420]">
              أطلب التعامل مع بيانات هذا البلاغ بسرية مهنية تامة
            </span>
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#CE1031] hover:bg-[#a60d28] text-white font-bold text-sm"
            >
              توثيق البلاغ وحفظه محلياً
            </button>
          </div>
        </form>
      )}

      {/* FORM: COMPLAINT */}
      {activeTab === 'complaint' && (
        <form
          onSubmit={handleComplaintSubmit}
          className="rounded-2xl bg-white border border-[#e3e9e5] p-6 sm:p-8 space-y-5"
          noValidate
        >
          <div className="pb-3 border-b border-[#e3e9e5]">
            <h2 className="text-lg font-bold text-[#1b2420]">شكاوى العمل الإعلامي والصحفي</h2>
            <p className="text-xs text-[#5c6a63]">
              لتسجيل الشكاوى العمالية أو النزاعات المهنية مع المؤسسات الإعلامية أو الجهات المختلفة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                الاسم الكامل <span className="text-[#CE1031]">*</span>
              </label>
              <input
                type="text"
                value={complaint.complainantName}
                onChange={(e) => updateComplaint({ complainantName: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
              />
              {errors.complainantName && (
                <p className="text-xs text-[#CE1031] mt-1">{errors.complainantName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                رقم الهاتف <span className="text-[#CE1031]">*</span>
              </label>
              <input
                type="tel"
                value={complaint.phone}
                onChange={(e) => updateComplaint({ phone: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420] tabular-nums"
              />
              {errors.phone && <p className="text-xs text-[#CE1031] mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                تصنيف الشكوى <span className="text-[#CE1031]">*</span>
              </label>
              <select
                value={complaint.complaintCategory}
                onChange={(e) => updateComplaint({ complaintCategory: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
              >
                <option value="">— اختر التصنيف —</option>
                <option value="نزاع تعاقدي أو مستحقات مالية">نزاع تعاقدي أو مستحقات مالية</option>
                <option value="فصل تعسفي من مؤسسة إعلامية">فصل تعسفي من مؤسسة إعلامية</option>
                <option value="ملكية فكرية ونسب مواد صحفية">ملكية فكرية ونسب مواد صحفية</option>
                <option value="معوقات إدارية أو نقابية">معوقات إدارية أو نقابية</option>
              </select>
              {errors.complaintCategory && (
                <p className="text-xs text-[#CE1031] mt-1">{errors.complaintCategory}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                الجهة المعنية بالشكوى
              </label>
              <input
                type="text"
                value={complaint.targetEntity}
                onChange={(e) => updateComplaint({ targetEntity: e.target.value })}
                placeholder="اسم المؤسسة أو الجهة"
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
              تفاصيل الشكوى <span className="text-[#CE1031]">*</span>
            </label>
            <textarea
              rows={4}
              value={complaint.details}
              onChange={(e) => updateComplaint({ details: e.target.value })}
              className="w-full p-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
            />
            {errors.details && <p className="text-xs text-[#CE1031] mt-1">{errors.details}</p>}
          </div>

          <FileUploadField
            label="مستندات داعمة للشكوى (اختياري)"
            hint="عقد عمل، مراسلات، أو PDF"
            value={complaint.attachment}
            onChange={(attachment) => updateComplaint({ attachment })}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#c9a24a] hover:bg-[#e2c98a] text-[#062a1e] font-extrabold text-sm"
            >
              تسجيل الشكوى محلياً
            </button>
          </div>
        </form>
      )}

      {/* FORM: CONTACT */}
      {activeTab === 'contact' && (
        <form
          onSubmit={handleContactSubmit}
          className="rounded-2xl bg-white border border-[#e3e9e5] p-6 sm:p-8 space-y-5"
          noValidate
        >
          <div className="pb-3 border-b border-[#e3e9e5]">
            <h2 className="text-lg font-bold text-[#1b2420]">راسلنا — نموذج التواصل</h2>
            <p className="text-xs text-[#5c6a63]">
              تعرّف على مراكز الاتحاد وخدماتها ووجّه استفسارك إلى المركز المختص.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                الاسم الكامل <span className="text-[#CE1031]">*</span>
              </label>
              <input
                type="text"
                value={contact.senderName}
                onChange={(e) => updateContact({ senderName: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
              />
              {errors.senderName && (
                <p className="text-xs text-[#CE1031] mt-1">{errors.senderName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                المركز أو الجهة المستهدفة
              </label>
              <select
                value={contact.targetCenter}
                onChange={(e) => updateContact({ targetCenter: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
              >
                <option value="المقر المركزي - دمشق">المقر المركزي - دمشق</option>
                {UNION_CENTERS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">رقم الهاتف</label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => updateContact({ phone: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420] tabular-nums"
              />
              {errors.phone && <p className="text-xs text-[#CE1031] mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                dir="ltr"
                value={contact.email}
                onChange={(e) => updateContact({ email: e.target.value })}
                className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420] text-left"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
              الموضوع <span className="text-[#CE1031]">*</span>
            </label>
            <input
              type="text"
              value={contact.subject}
              onChange={(e) => updateContact({ subject: e.target.value })}
              className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
            />
            {errors.subject && <p className="text-xs text-[#CE1031] mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
              نص الرسالة <span className="text-[#CE1031]">*</span>
            </label>
            <textarea
              rows={4}
              value={contact.message}
              onChange={(e) => updateContact({ message: e.target.value })}
              className="w-full p-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
            />
            {errors.message && <p className="text-xs text-[#CE1031] mt-1">{errors.message}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#04935f] hover:bg-[#0f5a3c] text-white font-bold text-sm"
            >
              حفظ الرسالة في الذاكرة المحلية
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
