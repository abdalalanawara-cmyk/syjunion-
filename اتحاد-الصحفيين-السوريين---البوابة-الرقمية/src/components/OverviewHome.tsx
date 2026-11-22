import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckSquare,
  CreditCard,
  FileCheck2,
  FolderKanban,
  Scale,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import { ImageWithFallback, UnionLogo } from './UnionEmblem';
import type { AppSection, UnionTask, UnionTransaction } from '../types/union';

interface OverviewHomeProps {
  onNavigate: (section: AppSection) => void;
  transactions: UnionTransaction[];
  tasks: UnionTask[];
  latestCardName?: string;
}

export function OverviewHome({
  onNavigate,
  transactions,
  tasks,
  latestCardName,
}: OverviewHomeProps) {
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const quickServices: {
    id: AppSection;
    title: string;
    subtitle: string;
    meta: string;
    icon: React.ReactNode;
    accent: 'emerald' | 'gold' | 'forest' | 'crimson';
  }[] = [
    {
      id: 'membership',
      title: 'شروط وطلب العضوية',
      subtitle: 'الانتساب إلى اتحاد الصحفيين بحسب المواد (6، 7، 8، 9)',
      meta: 'التسجيل متوقف حتى 01/01/2027 · فحص الأهلية متاح',
      icon: <UserPlus className="w-5 h-5" />,
      accent: 'gold',
    },
    {
      id: 'transfer',
      title: 'تعديل العضوية',
      subtitle: 'النقل إلى جدول الأعضاء العاملين بحسب المادتين (12، 13)',
      meta: 'تقديم طلب النقل وإرفاق الوثائق إلكترونياً',
      icon: <FileCheck2 className="w-5 h-5" />,
      accent: 'emerald',
    },
    {
      id: 'international-card',
      title: 'طلب بطاقة الصحافة الدولية',
      subtitle: 'تُمنح للصحفي المحترف العضو العامل (الأساسي) في الاتحاد',
      meta: 'نموذج من 3 خطوات · حفظ المسودة تلقائياً',
      icon: <CreditCard className="w-5 h-5" />,
      accent: 'forest',
    },
    {
      id: 'support',
      title: 'الإبلاغ عن انتهاك والشكاوى',
      subtitle: 'توثيق الانتهاكات بحق الصحفيين وشكاوى العمل الإعلامي',
      meta: 'المقر المركزي دمشق · متابعة محلية آمنة',
      icon: <ShieldAlert className="w-5 h-5" />,
      accent: 'crimson',
    },
  ];

  const accentMap = {
    emerald: 'bg-[#e6f2ec] text-[#04935f] border-[#04935f]/25',
    gold: 'bg-[#fdf8eb] text-[#9b7622] border-[#c9a24a]/35',
    forest: 'bg-[#0b3d2a] text-[#e2c98a] border-[#0f5a3c]',
    crimson: 'bg-[#fbecea] text-[#CE1031] border-[#CE1031]/25',
  };

  return (
    <div className="space-y-8">
      {/* Hero Grid: Institutional Banner + Digital Press Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-[#0b3d2a] bg-[#062a1e] min-h-[290px] flex flex-col justify-end shadow-sm">
          <ImageWithFallback
            src="/src/assets/images/sju_damascus_headquarters_1795335033560.jpg"
            alt="المقر المركزي لاتحاد الصحفيين في الجمهورية العربية السورية - دمشق"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#062a1e] via-[#062a1e]/80 to-[#062a1e]/35" />
          <div className="relative p-6 sm:p-8 space-y-3">
            <p className="text-xs font-bold text-[#e2c98a]">
              الجمهورية العربية السورية · المقر المركزي دمشق
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-balance leading-snug">
              البوابة الرقمية لاتحاد الصحفيين السوريين
            </h1>
            <p className="text-sm sm:text-base text-[#e6f2ec]/90 max-w-xl leading-relaxed">
              منظومة الخدمات النقابية والقانونية للصحفيين والصحفيات: طلبات الانتساب وتعديل العضوية،
              بطاقة الصحافة الدولية، اللجان والصناديق، وحفظ المعاملات والمهام محلياً دون الحاجة لاتصال دائم.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('international-card')}
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#04935f] hover:bg-[#147a4f] text-white font-bold text-sm transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                طلب البطاقة الدولية
              </button>
              <button
                type="button"
                onClick={() => onNavigate('membership')}
                className="min-h-[44px] px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-[#e2c98a]/40 transition-colors whitespace-nowrap shrink-0"
              >
                شروط العضوية (المواد 6–9)
              </button>
            </div>
          </div>
        </div>

        {/* Digital Press Card Preview (Deep Syrian Emerald & Gold from syjunion.sy) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#c9a24a]/60 bg-gradient-to-br from-[#0b3d2a] via-[#062a1e] to-[#0f5a3c] sju-pattern-bg p-6 flex flex-col justify-between text-white shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <UnionLogo className="h-9 w-auto mb-2" />
              <p className="text-xs font-bold text-[#e2c98a]">بطاقة العضوية الصحفية الرقمية</p>
              <h2 className="text-lg font-extrabold text-white">
                {latestCardName || 'ملف الصحفي المحلي'}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#e6f2ec] shrink-0">
              <BadgeCheck className="w-4 h-4 text-[#c9a24a]" />
              <span>محفوظ محلياً</span>
            </div>
          </div>

          <div className="my-5 rounded-xl bg-[#062a1e]/75 border border-[#c9a24a]/35 p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-extrabold text-white tabular-nums">{transactions.length}</p>
              <p className="text-xs text-[#e6f2ec]/80">معاملة محفوظة</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#e2c98a] tabular-nums">{pendingTasks}</p>
              <p className="text-xs text-[#e6f2ec]/80">مهمة قيد التنفيذ</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#7bdcb5] tabular-nums">{completedTasks}</p>
              <p className="text-xs text-[#e6f2ec]/80">مهمة منجزة</p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/15">
            <button
              type="button"
              onClick={() => onNavigate('vault')}
              className="min-h-[44px] w-full px-4 py-2 rounded-lg bg-[#c9a24a] hover:bg-[#e2c98a] text-[#062a1e] font-extrabold text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              <FolderKanban className="w-4 h-4" />
              إدارة المعاملات والمهام المحلية
            </button>
          </div>
        </div>
      </section>

      {/* Core Union Services */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#1b2420]">الخدمات النقابية الرئيسية</h2>
          <p className="text-sm text-[#5c6a63]">
            اختر الخدمة المطلوبة لإتمام الطلب وحفظه تلقائياً في ذاكرة الجهاز
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickServices.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => onNavigate(service.id)}
              className="group text-right rounded-2xl bg-white hover:bg-[#f3f8f5] border border-[#e3e9e5] hover:border-[#04935f]/45 p-5 transition-all flex items-start justify-between gap-4 min-h-[112px] shadow-[0_1px_2px_rgba(6,42,30,0.04)]"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${accentMap[service.accent]}`}
                >
                  {service.icon}
                </div>
                <div className="space-y-1.5 min-w-0">
                  <h3 className="text-base font-bold text-[#1b2420] group-hover:text-[#04935f] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-[#5c6a63] leading-relaxed">{service.subtitle}</p>
                  <p className="text-xs font-semibold text-[#0f5a3c] pt-0.5">{service.meta}</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-[#5c6a63] group-hover:text-[#04935f] group-hover:-translate-x-1 transition-all shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </section>

      {/* Union Structure & Legal Overview Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#e3e9e5] bg-white flex flex-col">
          <div className="h-44 relative">
            <ImageWithFallback
              src="/src/assets/images/sju_press_badge_scene_1795335032907.jpg"
              alt="أدوات العمل الصحفي الميداني"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062a1e]/70 via-transparent to-transparent" />
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#1b2420]">هيكلية الاتحاد واللجان والصناديق</h3>
              <p className="text-sm text-[#5c6a63] leading-relaxed">
                لجنة القيد والقبول، لجنة الصحافة الرياضية، لجنة الصحافة الاستقصائية، الصندوق التعاوني الاجتماعي، صندوق تقاعد الصحفيين، وفروع المحافظات.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('structure')}
              className="min-h-[44px] px-4 py-2.5 rounded-lg bg-[#f3f8f5] hover:bg-[#e6f2ec] text-[#0b3d2a] text-sm font-bold border border-[#e3e9e5] inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Building2 className="w-4 h-4 text-[#04935f]" />
              استعراض اللجان والصناديق والفروع
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-[#e3e9e5] bg-white p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-[#04935f]" />
                <h3 className="text-lg font-bold text-[#1b2420]">قائمة المهام السريعة للصحفي</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('vault')}
                className="text-xs font-bold text-[#04935f] hover:underline min-h-[36px] px-2"
              >
                عرض الكل
              </button>
            </div>

            {tasks.length === 0 ? (
              <p className="text-sm text-[#5c6a63] py-6 text-center">
                لا توجد مهام مسجلة حالياً. أضف مهامك من سجل المعاملات والمهام.
              </p>
            ) : (
              <ul className="divide-y divide-[#e3e9e5]">
                {tasks.slice(0, 3).map((task) => (
                  <li key={task.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <CheckSquare
                        className={`w-4 h-4 mt-1 shrink-0 ${
                          task.completed ? 'text-[#04935f]' : 'text-[#5c6a63]'
                        }`}
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold ${
                            task.completed ? 'line-through text-[#5c6a63]' : 'text-[#1b2420]'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-[#5c6a63]">
                          {task.category} · الأولوية: {task.priority}
                          {task.dueDate ? ` · الموعد: ${task.dueDate}` : ''}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl bg-[#e6f2ec] border border-[#04935f]/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-[#062a1e]">جاهز للعمل بدون اتصال بالإنترنت</p>
              <p className="text-xs text-[#0b3d2a]">
                تحفظ جميع مسوداتك ومعاملاتك ومهامك تلقائياً في الذاكرة المحلية للهاتف.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('support')}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-[#0b3d2a] hover:bg-[#062a1e] text-xs font-bold text-white whitespace-nowrap shrink-0 transition-colors"
            >
              تواصل مع الاتحاد
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
