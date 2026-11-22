import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ListPlus,
  Scale,
  XCircle,
} from 'lucide-react';
import { MEMBERSHIP_ARTICLES, REQUIRED_MEMBERSHIP_DOCUMENTS, UNION_BRANCHES } from '../data/unionContent';
import { generateId, generateReferenceNumber, loadMembershipPrepDraft, saveMembershipPrepDraft } from '../lib/storage';
import type { AppSection, MembershipPrepDraft, UnionTask, UnionTransaction } from '../types/union';

interface MembershipConditionsViewProps {
  onSaveTransaction: (tx: UnionTransaction) => void;
  onAddTasks: (newTasks: UnionTask[]) => void;
  onNavigate: (section: AppSection) => void;
}

const ELIGIBILITY_ITEMS: {
  key: keyof MembershipPrepDraft['eligibilityChecks'];
  label: string;
  articleRef: string;
}[] = [
  {
    key: 'syrianOrPalestinian',
    label: 'عربي سوري منذ 5 سنوات على الأقل، أو فلسطيني مشمول بالقانون 260 لعام 1956، أو عربي مقيم (بقرار المكتب)',
    articleRef: 'المادة 6 / 7',
  },
  {
    key: 'ageBetween20And60',
    label: 'أتممت العشرين من العمر ولم أتجاوز الستين عاماً (باستثناء الصحفي المشارك)',
    articleRef: 'المادة 6',
  },
  {
    key: 'highSchoolOrEquivalent',
    label: 'حامل شهادة الدراسة الثانوية أو ما يعادلها على الأقل (أو من العاملين قبل المرسوم 58 لعام 1974)',
    articleRef: 'المادة 6',
  },
  {
    key: 'cleanCriminalRecord',
    label: 'غير محكوم بأية عقوبة جنائية أو عقوبة جنحة شائنة',
    articleRef: 'المادة 6',
  },
  {
    key: 'goodConduct',
    label: 'كامل الأهلية وذو سيرة حسنة توحي بالثقة والاحترام الواجبين للمهنة',
    articleRef: 'المادة 6',
  },
  {
    key: 'notDismissed',
    label: 'غير معزول أو مطرود من وظائف الدولة أو القطاع العام لسبب ماس بأمن الدولة أو شرف الوظيفة',
    articleRef: 'المادة 6',
  },
  {
    key: 'journalismPrimaryWork',
    label: 'غير معين لدى الجهات العامة بمهنة أو عمل لا علاقة لهما بالصحافة',
    articleRef: 'المادة 6',
  },
];

export function MembershipConditionsView({
  onSaveTransaction,
  onAddTasks,
  onNavigate,
}: MembershipConditionsViewProps) {
  const [activeArticleId, setActiveArticleId] = useState<string>(MEMBERSHIP_ARTICLES[0].id);
  const [prepDraft, setPrepDraft] = useState<MembershipPrepDraft>(() => loadMembershipPrepDraft());
  const [showPrepPanel, setShowPrepPanel] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeArticle =
    MEMBERSHIP_ARTICLES.find((a) => a.id === activeArticleId) ?? MEMBERSHIP_ARTICLES[0];

  const checksPassedCount = Object.values(prepDraft.eligibilityChecks).filter(Boolean).length;
  const allEligible = checksPassedCount === ELIGIBILITY_ITEMS.length;

  function updateDraft(patch: Partial<MembershipPrepDraft>) {
    const next = { ...prepDraft, ...patch };
    setPrepDraft(next);
    saveMembershipPrepDraft(next);
  }

  function toggleEligibility(key: keyof MembershipPrepDraft['eligibilityChecks']) {
    const next: MembershipPrepDraft = {
      ...prepDraft,
      eligibilityChecks: {
        ...prepDraft.eligibilityChecks,
        [key]: !prepDraft.eligibilityChecks[key],
      },
    };
    setPrepDraft(next);
    saveMembershipPrepDraft(next);
  }

  function handleAddDocsToTasks() {
    const now = new Date().toISOString();
    const newTasks: UnionTask[] = REQUIRED_MEMBERSHIP_DOCUMENTS.map((doc) => ({
      id: generateId(),
      title: `تجهيز وثيقة الانتساب: ${doc.title}`,
      notes: `${doc.detail} — استعداداً لفتح باب التسجيل في 01/01/2027`,
      category: 'وثائق العضوية',
      priority: 'متوسط',
      dueDate: '2026-12-25',
      completed: false,
      createdAt: now,
    }));
    onAddTasks(newTasks);
    setFeedback('تمت إضافة الوثائق الخمس المطلوبة إلى قائمة مهامك المحلية.');
  }

  function handleSavePrepApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!prepDraft.fullName.trim() || !prepDraft.phone.trim()) {
      setFeedback('يرجى إدخال الاسم الكامل ورقم الهاتف لحفظ ملف التجهيز محلياً.');
      return;
    }

    const now = new Date().toISOString();
    const tx: UnionTransaction = {
      id: generateId(),
      referenceNumber: generateReferenceNumber('MEM'),
      type: 'membership-prep',
      title: 'ملف تحضيري لطلب الانتساب (مؤجل حتى 01/01/2027)',
      applicantName: prepDraft.fullName.trim(),
      branch: prepDraft.branch || 'غير محدد',
      status: 'جاهز للتقديم',
      createdAt: now,
      updatedAt: now,
      summary: `تم التحقق من ${checksPassedCount} من أصل 7 شروط قانونية (${allEligible ? 'مستوفٍ للشروط' : 'يحتاج استكمال شروط'}).`,
      payload: {
        الاسم: prepDraft.fullName.trim(),
        الهاتف: prepDraft.phone.trim(),
        الفرع: prepDraft.branch || 'دمشق',
        نتيجة_فحص_الأهلية: `${checksPassedCount}/7`,
        ملاحظات: prepDraft.notes || 'لا توجد',
      },
    };
    onSaveTransaction(tx);
    setFeedback(
      `تم حفظ ملف طلب العضوية التحضيري في الذاكرة المحلية برقم مرجعي ${tx.referenceNumber} ليكون جاهزاً فور فتح باب التسجيل.`
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold text-[#04935f]">طلب العضوية · العضوية - شروط العضوية</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b2420]">
              شروط العضوية — الانتساب إلى اتحاد الصحفيين
            </h1>
            <p className="text-sm sm:text-base text-[#5c6a63]">
              بحسب المواد (6، 7، 8، 9) من قانون اتحاد الصحفيين
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('transfer')}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-white hover:bg-[#e6f2ec] text-sm font-bold text-[#0b3d2a] border border-[#e3e9e5] inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            <span>الانتقال إلى تعديل العضوية</span>
            <ArrowLeft className="w-4 h-4 text-[#04935f]" />
          </button>
        </div>
      </header>

      {/* Registration Suspension Banner (Official Crimson Alert) */}
      <div className="rounded-2xl border border-[#CE1031]/30 bg-[#fbecea] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#CE1031] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-base font-extrabold text-[#CE1031]">
              التسجيل متوقف حالياً حتى 01/01/2027
            </p>
            <p className="text-xs sm:text-sm text-[#1b2420]">
              يمكنك استخدام فحص الأهلية وتجهيز وثائقك وحفظ مسودة طلبك في الذاكرة المحلية لتقديمها فور إعادة فتح باب الانتساب.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPrepPanel((prev) => !prev)}
          className="min-h-[44px] px-4 py-2 rounded-lg bg-[#0b3d2a] hover:bg-[#062a1e] text-white font-bold text-sm whitespace-nowrap shrink-0 transition-colors"
        >
          {showPrepPanel ? 'إخفاء أداة التحضير' : 'فحص الأهلية وتجهيز الملف'}
        </button>
      </div>

      {/* Article Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="tablist" aria-label="مواد قانون اتحاد الصحفيين">
        {MEMBERSHIP_ARTICLES.map((article) => {
          const isActive = article.id === activeArticle.id;
          return (
            <button
              key={article.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveArticleId(article.id)}
              className={`min-h-[64px] rounded-xl p-3.5 text-right border transition-all ${
                isActive
                  ? 'bg-[#0b3d2a] border-[#062a1e] text-white shadow-sm'
                  : 'bg-white border-[#e3e9e5] hover:bg-[#f3f8f5] text-[#1b2420]'
              }`}
            >
              <p className={`text-sm font-bold ${isActive ? 'text-[#e2c98a]' : 'text-[#04935f]'}`}>
                {article.tabTitle}
              </p>
              <p className={`text-xs mt-0.5 truncate ${isActive ? 'text-[#e6f2ec]' : 'text-[#5c6a63]'}`}>
                {article.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Legal Article Card */}
      <section className="rounded-2xl bg-white border border-[#e3e9e5] p-6 sm:p-8 space-y-6">
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
              <p className="text-xs text-[#5c6a63]">قانون اتحاد الصحفيين في الجمهورية العربية السورية</p>
            </div>
          </div>
          <Scale className="w-5 h-5 text-[#04935f] hidden sm:block" />
        </div>

        {activeArticle.lead && (
          <p className="text-base font-bold text-[#0f5a3c]">{activeArticle.lead}</p>
        )}

        {activeArticle.items && (
          <ol className="space-y-3">
            {activeArticle.items.map((item, idx) => (
              <li
                key={idx}
                className="rounded-xl bg-[#f3f8f5] border border-[#e3e9e5] p-4 flex items-start gap-3.5"
              >
                <span className="w-7 h-7 rounded-lg bg-[#04935f] text-white text-xs font-extrabold flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                  {item.label ?? idx + 1}
                </span>
                <p className="text-sm sm:text-base text-[#1b2420] leading-relaxed">{item.text}</p>
              </li>
            ))}
          </ol>
        )}

        {activeArticle.paragraphs && (
          <div className="space-y-3">
            {activeArticle.paragraphs.map((para, idx) => (
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
        )}
      </section>

      {/* Required Documents & Callout Section */}
      <section className="rounded-2xl bg-white border border-[#e3e9e5] p-6 sm:p-7 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-[#1b2420]">هل تستوفي شروط العضوية؟</h3>
            <p className="text-sm text-[#5c6a63] leading-relaxed">
              قدّم طلب الانتساب إلكترونياً وأرفق الوثائق المطلوبة: صورة شخصية، صورة الهوية، الشهادة العلمية، وثيقة غير محكوم، وإثبات العمل الصحفي.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddDocsToTasks}
            className="min-h-[44px] px-4 py-2.5 rounded-lg bg-[#04935f] hover:bg-[#0f5a3c] text-white font-bold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <ListPlus className="w-4 h-4" />
            أضف الوثائق الخمس لمهامي
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {REQUIRED_MEMBERSHIP_DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl bg-[#f3f8f5] border border-[#e3e9e5] p-3.5 space-y-1"
            >
              <div className="flex items-center gap-2 text-[#04935f]">
                <FileText className="w-4 h-4 shrink-0" />
                <p className="text-sm font-bold text-[#1b2420]">{doc.title}</p>
              </div>
              <p className="text-xs text-[#5c6a63] leading-relaxed">{doc.detail}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e9e5]">
          <span className="text-sm font-extrabold text-[#CE1031]">
            التسجيل متوقف حالياً حتى 01/01/2027
          </span>
          <button
            type="button"
            onClick={() => setShowPrepPanel(true)}
            className="text-sm font-bold text-[#04935f] hover:underline min-h-[40px]"
          >
            فتح أداة فحص الأهلية وحفظ المسودة محلياً
          </button>
        </div>
      </section>

      {/* Interactive Eligibility Check & Local Prep Form */}
      {showPrepPanel && (
        <section className="rounded-2xl bg-white border border-[#04935f]/40 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e3e9e5]">
            <div className="flex items-center gap-2.5">
              <ClipboardCheck className="w-5 h-5 text-[#04935f]" />
              <h3 className="text-lg font-bold text-[#1b2420]">
                فحص استيفاء الشروط وحفظ ملف الانتساب التحضيري
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              {allEligible ? (
                <span className="inline-flex items-center gap-1.5 text-[#04935f]">
                  <CheckCircle2 className="w-4 h-4" />
                  مستوفٍ لجميع الشروط ({checksPassedCount}/7)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[#9b7622]">
                  <XCircle className="w-4 h-4" />
                  مكتمل جزئياً ({checksPassedCount}/7)
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {ELIGIBILITY_ITEMS.map((item) => {
              const checked = prepDraft.eligibilityChecks[item.key];
              return (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    checked
                      ? 'bg-[#e6f2ec] border-[#04935f]/40'
                      : 'bg-[#f3f8f5] border-[#e3e9e5]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEligibility(item.key)}
                    className="mt-1 w-5 h-5 accent-[#04935f] rounded cursor-pointer shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1b2420] leading-relaxed">{item.label}</p>
                    <p className="text-xs text-[#5c6a63] mt-0.5">{item.articleRef}</p>
                  </div>
                </label>
              );
            })}
          </div>

          <form onSubmit={handleSavePrepApplication} className="space-y-4 pt-2 border-t border-[#e3e9e5]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  الاسم الكامل <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="text"
                  value={prepDraft.fullName}
                  onChange={(e) => updateDraft({ fullName: e.target.value })}
                  placeholder="الاسم الثلاثي"
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] placeholder:text-[#5c6a63]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                  رقم الهاتف <span className="text-[#CE1031]">*</span>
                </label>
                <input
                  type="tel"
                  value={prepDraft.phone}
                  onChange={(e) => updateDraft({ phone: e.target.value })}
                  placeholder="09xxxxxxxx"
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] placeholder:text-[#5c6a63] tabular-nums"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">الفرع المختص</label>
                <select
                  value={prepDraft.branch}
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
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1b2420] mb-1.5">
                ملاحظات إضافية حول المؤسسة أو الشهادة
              </label>
              <textarea
                rows={2}
                value={prepDraft.notes}
                onChange={(e) => updateDraft({ notes: e.target.value })}
                placeholder="مثال: لدي خبرة ميدانية منذ 2023 وأعمل في..."
                className="w-full p-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] focus:border-[#04935f] text-sm text-[#1b2420] placeholder:text-[#5c6a63]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#5c6a63]">
                يُحفظ الملف محلياً في الذاكرة المحلية للهاتف حتى إعادة فتح التسجيل في 01/01/2027.
              </p>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#04935f] hover:bg-[#0f5a3c] text-white font-bold text-sm transition-colors"
              >
                حفظ الملف التحضيري في الذاكرة المحلية
              </button>
            </div>
          </form>
        </section>
      )}

      {feedback && (
        <div
          role="status"
          className="rounded-xl bg-[#e6f2ec] border border-[#04935f]/40 p-4 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 text-sm font-bold text-[#062a1e]">
            <CheckCircle2 className="w-5 h-5 text-[#04935f] shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('vault')}
            className="text-xs font-bold text-[#04935f] underline whitespace-nowrap shrink-0"
          >
            عرض في سجل المعاملات
          </button>
        </div>
      )}
    </div>
  );
}
