import { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Landmark,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  UNION_BRANCHES,
  UNION_CENTERS,
  UNION_COMMITTEES,
  UNION_FUNDS,
} from '../data/unionContent';
import { generateId, generateReferenceNumber } from '../lib/storage';
import type { UnionTransaction } from '../types/union';

interface CommitteesFundsBranchesViewProps {
  onSaveTransaction: (tx: UnionTransaction) => void;
}

type SubTab = 'committees' | 'funds' | 'branches' | 'centers';

export function CommitteesFundsBranchesView({
  onSaveTransaction,
}: CommitteesFundsBranchesViewProps) {
  const [tab, setTab] = useState<SubTab>('committees');
  const [selectedTarget, setSelectedTarget] = useState<{
    kind: 'committee' | 'fund';
    name: string;
  } | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTarget || !applicantName.trim() || !phone.trim()) {
      setFeedback('يرجى إدخال الاسم الكامل ورقم الهاتف لإرسال الطلب.');
      return;
    }

    const now = new Date().toISOString();
    const ref = generateReferenceNumber(selectedTarget.kind === 'committee' ? 'COM' : 'FND');
    const tx: UnionTransaction = {
      id: generateId(),
      referenceNumber: ref,
      type: selectedTarget.kind === 'committee' ? 'committee-request' : 'fund-request',
      title:
        selectedTarget.kind === 'committee'
          ? `طلب انضمام / مراجعة: ${selectedTarget.name}`
          : `طلب استفادة من: ${selectedTarget.name}`,
      applicantName: applicantName.trim(),
      status: 'محفوظ محلياً',
      createdAt: now,
      updatedAt: now,
      summary: `رقم العضوية: ${membershipNumber.trim() || 'غير مرفق'} · ${notes.trim() || 'طلب قياسي'}`,
      payload: {
        الجهة: selectedTarget.name,
        الاسم: applicantName.trim(),
        رقم_العضوية: membershipNumber.trim() || 'غير محدد',
        الهاتف: phone.trim(),
        التفاصيل: notes.trim() || 'لا توجد تفاصيل إضافية',
      },
    };

    onSaveTransaction(tx);
    setSelectedTarget(null);
    setApplicantName('');
    setMembershipNumber('');
    setPhone('');
    setNotes('');
    setFeedback(`تم حفظ الطلب لدى (${tx.title}) بالرقم المرجعي ${ref} في الذاكرة المحلية.`);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold text-[#04935f]">
          لجان الاتحاد · صناديق الاتحاد · مراكز الاتحاد · فروع الاتحاد
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b2420]">
          مؤسسات الاتحاد وفروعه في المحافظات
        </h1>
        <p className="text-sm sm:text-base text-[#5c6a63]">
          استعرض صلاحيات اللجان التخصصية، خدمات الصندوق التعاوني وصندوق التقاعد، ومراكز وفروع الاتحاد في الجمهورية العربية السورية.
        </p>
      </header>

      {/* Segmented Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5" role="tablist">
        {[
          { id: 'committees' as const, label: 'لجان الاتحاد', icon: Users },
          { id: 'funds' as const, label: 'صناديق الاتحاد', icon: Landmark },
          { id: 'branches' as const, label: 'فروع المحافظات', icon: MapPin },
          { id: 'centers' as const, label: 'مراكز الاتحاد وخدماتها', icon: Building2 },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                active
                  ? 'bg-[#0b3d2a] border-[#062a1e] text-[#e2c98a]'
                  : 'bg-white border-[#e3e9e5] text-[#1b2420] hover:bg-[#f3f8f5]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          role="status"
          className="rounded-xl bg-[#e6f2ec] border border-[#04935f]/40 p-4 flex items-center gap-2.5 text-sm font-bold text-[#062a1e]"
        >
          <CheckCircle2 className="w-5 h-5 text-[#04935f] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* COMMITTEES */}
      {tab === 'committees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {UNION_COMMITTEES.map((committee) => (
            <article
              key={committee.id}
              className="rounded-2xl bg-white border border-[#e3e9e5] p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#9b7622]">{committee.category}</p>
                <h2 className="text-lg font-bold text-[#1b2420]">{committee.name}</h2>
                <p className="text-sm text-[#5c6a63] leading-relaxed">{committee.summary}</p>
                <ul className="space-y-2 pt-2 border-t border-[#e3e9e5]">
                  {committee.mandate.map((m, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[#1b2420] flex items-start gap-2">
                      <span className="text-[#04935f] font-bold">·</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 pt-3 border-t border-[#e3e9e5]">
                <p className="text-xs font-semibold text-[#0f5a3c]">{committee.meetingSchedule}</p>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTarget({ kind: 'committee', name: committee.name })
                  }
                  className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-[#f3f8f5] hover:bg-[#e6f2ec] text-sm font-bold text-[#0b3d2a] border border-[#e3e9e5] transition-colors"
                >
                  تقديم طلب انتساب أو مراسلة للجنة
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* FUNDS */}
      {tab === 'funds' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {UNION_FUNDS.map((fund) => (
            <article
              key={fund.id}
              className="rounded-2xl bg-white border border-[#e3e9e5] p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#04935f]">{fund.category}</p>
                <h2 className="text-xl font-bold text-[#1b2420]">{fund.name}</h2>
                <p className="text-sm text-[#5c6a63] leading-relaxed">{fund.summary}</p>
                <ul className="space-y-2 pt-2 border-t border-[#e3e9e5]">
                  {fund.benefits.map((b, i) => (
                    <li key={i} className="text-sm text-[#1b2420] flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#c9a24a] shrink-0 mt-1" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 pt-3 border-t border-[#e3e9e5]">
                <p className="text-xs text-[#5c6a63]">
                  <span className="font-bold text-[#1b2420]">شروط الاستفادة: </span>
                  {fund.eligibility}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedTarget({ kind: 'fund', name: fund.name })}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#04935f] hover:bg-[#0f5a3c] text-white font-bold text-sm transition-colors"
                >
                  تسجيل طلب مساعدة أو استفسار مالي
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* BRANCHES */}
      {tab === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {UNION_BRANCHES.map((branch) => (
            <article
              key={branch.id}
              className="rounded-2xl bg-white border border-[#e3e9e5] p-5 space-y-3"
            >
              <div>
                <p className="text-xs font-bold text-[#9b7622]">{branch.city}</p>
                <h2 className="text-base font-bold text-[#1b2420] mt-0.5">{branch.name}</h2>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-[#5c6a63]">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#04935f] shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </p>
                <p className="flex items-center gap-2 tabular-nums">
                  <Phone className="w-4 h-4 text-[#0f5a3c] shrink-0" />
                  <span dir="ltr">{branch.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#c9a24a] shrink-0" />
                  <span>{branch.hours}</span>
                </p>
              </div>
              <p className="text-xs font-semibold text-[#04935f] pt-2 border-t border-[#e3e9e5]">
                {branch.services.join(' · ')}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* CENTERS */}
      {tab === 'centers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {UNION_CENTERS.map((center) => (
            <article
              key={center.id}
              className="rounded-2xl bg-white border border-[#e3e9e5] p-6 space-y-4"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#04935f]">{center.location}</p>
                <h2 className="text-lg font-bold text-[#1b2420]">{center.name}</h2>
              </div>
              <p className="text-sm text-[#5c6a63] leading-relaxed">{center.description}</p>
              <ul className="space-y-1.5 pt-2 border-t border-[#e3e9e5]">
                {center.services.map((s, i) => (
                  <li key={i} className="text-xs sm:text-sm text-[#1b2420] flex items-center gap-2">
                    <span className="text-[#04935f] font-bold">·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {/* Inline Request Form */}
      {selectedTarget && (
        <form
          onSubmit={handleSubmitRequest}
          className="rounded-2xl bg-white border border-[#04935f]/40 p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#e3e9e5]">
            <h3 className="text-base font-bold text-[#1b2420]">
              طلب موجه إلى: <span className="text-[#04935f]">{selectedTarget.name}</span>
            </h3>
            <button
              type="button"
              onClick={() => setSelectedTarget(null)}
              className="text-xs font-bold text-[#5c6a63] hover:text-[#1b2420] min-h-[36px] px-2"
            >
              إغلاق
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              required
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="الاسم الكامل *"
              className="min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
            />
            <input
              type="text"
              value={membershipNumber}
              onChange={(e) => setMembershipNumber(e.target.value)}
              placeholder="رقم العضوية في الاتحاد"
              className="min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420] tabular-nums"
            />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="رقم الهاتف *"
              className="min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420] tabular-nums"
            />
          </div>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="تفاصيل الطلب أو الاستفسار..."
            className="w-full p-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
          />
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2 rounded-lg bg-[#04935f] hover:bg-[#0f5a3c] text-white font-bold text-sm"
            >
              حفظ الطلب في الذاكرة المحلية
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
