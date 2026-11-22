import { useEffect, useState } from 'react';
import {
  Building2,
  CreditCard,
  FileCheck2,
  FolderKanban,
  Home,
  ShieldAlert,
  UserPlus,
  WifiOff,
  Wifi,
} from 'lucide-react';
import { CommitteesFundsBranchesView } from './components/CommitteesFundsBranchesView';
import { InternationalCardWizard } from './components/InternationalCardWizard';
import { MembershipConditionsView } from './components/MembershipConditionsView';
import { MembershipTransferView } from './components/MembershipTransferView';
import { OverviewHome } from './components/OverviewHome';
import { SupportViolationsView } from './components/SupportViolationsView';
import { TransactionsTasksView } from './components/TransactionsTasksView';
import { UnionLogo } from './components/UnionEmblem';
import {
  loadActiveSection,
  loadTasks,
  loadTransactions,
  saveActiveSection,
  saveTasks,
  saveTransactions,
} from './lib/storage';
import type {
  AppSection,
  TransactionStatus,
  UnionTask,
  UnionTransaction,
} from './types/union';

const NAV_ITEMS: {
  id: AppSection;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'home', label: 'الرئيسية', mobileLabel: 'الرئيسية', icon: Home },
  { id: 'membership', label: 'شروط العضوية', mobileLabel: 'العضوية', icon: UserPlus },
  { id: 'transfer', label: 'تعديل العضوية', mobileLabel: 'التعديل', icon: FileCheck2 },
  { id: 'international-card', label: 'البطاقة الدولية', mobileLabel: 'البطاقة', icon: CreditCard },
  { id: 'structure', label: 'اللجان والصناديق والفروع', mobileLabel: 'اللجان', icon: Building2 },
  { id: 'support', label: 'الانتهاكات والشكاوى والتواصل', mobileLabel: 'التواصل', icon: ShieldAlert },
  { id: 'vault', label: 'المعاملات والمهام (محلي)', mobileLabel: 'سجلي', icon: FolderKanban },
];

export default function App() {
  const [section, setSection] = useState<AppSection>(() => loadActiveSection());
  const [transactions, setTransactions] = useState<UnionTransaction[]>(() => loadTransactions());
  const [tasks, setTasks] = useState<UnionTask[]>(() => loadTasks());
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  function handleNavigate(next: AppSection) {
    setSection(next);
    saveActiveSection(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSaveTransaction(tx: UnionTransaction) {
    setTransactions((prev) => {
      const updated = [tx, ...prev];
      saveTransactions(updated);
      return updated;
    });
  }

  function handleUpdateTransactionStatus(id: string, status: TransactionStatus) {
    setTransactions((prev) => {
      const updated = prev.map((tx) =>
        tx.id === id ? { ...tx, status, updatedAt: new Date().toISOString() } : tx
      );
      saveTransactions(updated);
      return updated;
    });
  }

  function handleDeleteTransaction(id: string) {
    setTransactions((prev) => {
      const updated = prev.filter((tx) => tx.id !== id);
      saveTransactions(updated);
      return updated;
    });
  }

  function handleAddTask(task: UnionTask) {
    setTasks((prev) => {
      const updated = [task, ...prev];
      saveTasks(updated);
      return updated;
    });
  }

  function handleAddTasks(newTasks: UnionTask[]) {
    setTasks((prev) => {
      const existingTitles = new Set(prev.map((t) => t.title));
      const unique = newTasks.filter((t) => !existingTitles.has(t.title));
      const updated = [...unique, ...prev];
      saveTasks(updated);
      return updated;
    });
  }

  function handleToggleTask(id: string) {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      saveTasks(updated);
      return updated;
    });
  }

  function handleDeleteTask(id: string) {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTasks(updated);
      return updated;
    });
  }

  const latestCardTx = transactions.find((t) => t.type === 'international-card');
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const mobileBottomItems = [
    NAV_ITEMS[0],
    NAV_ITEMS[1],
    NAV_ITEMS[3],
    NAV_ITEMS[5],
    NAV_ITEMS[6],
  ];

  return (
    <div className="min-h-screen bg-[#f2f2ef] text-[#1b2420] flex flex-col lg:flex-row">
      {/* Mobile Compact Top App Bar (Deep Syrian Emerald matching syjunion.sy with official White Logo) */}
      <header className="lg:hidden sticky top-0 z-30 h-14 px-4 bg-gradient-to-l from-[#062a1e] via-[#0b3d2a] to-[#0f5a3c] border-b border-[#c9a24a]/35 flex items-center justify-between gap-3 text-white">
        <button
          type="button"
          onClick={() => handleNavigate('home')}
          className="flex items-center min-w-0"
          aria-label="العودة إلى الرئيسية - اتحاد الصحفيين السوريين"
        >
          <UnionLogo className="h-9 w-auto" />
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {!isOnline && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#e2c98a]">
              <WifiOff className="w-3.5 h-3.5" />
              محلي
            </span>
          )}
          <button
            type="button"
            onClick={() => handleNavigate('structure')}
            className="min-h-[40px] px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-[#c9a24a]/40 text-xs font-bold text-white whitespace-nowrap"
          >
            اللجان والفروع
          </button>
        </div>
      </header>

      {/* Desktop Institutional Sidebar (Deep Syrian Emerald #062a1e -> #0b3d2a from syjunion.sy) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-gradient-to-b from-[#062a1e] via-[#0b3d2a] to-[#062a1e] sju-pattern-bg text-white border-l border-[#c9a24a]/30 p-5 justify-between">
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="w-full text-right p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#c9a24a]/30 transition-colors flex flex-col items-start gap-2"
          >
            <UnionLogo className="h-12 w-auto" />
            <span className="text-[11px] font-semibold text-[#e2c98a]">
              الجمهورية العربية السورية · البوابة الرقمية
            </span>
          </button>

          <nav aria-label="القائمة الرئيسية" className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between gap-3 transition-colors ${
                    active
                      ? 'bg-[#04935f] text-white border border-[#e2c98a]/40 shadow-sm'
                      : 'text-[#e6f2ec]/85 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#e2c98a]' : ''}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.id === 'vault' && (transactions.length > 0 || pendingTasksCount > 0) && (
                    <span className="text-xs font-extrabold text-[#e2c98a] tabular-nums shrink-0">
                      {transactions.length + pendingTasksCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="rounded-xl bg-[#062a1e]/80 border border-[#c9a24a]/30 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">الذاكرة المحلية</span>
            <span className={`inline-flex items-center gap-1 font-bold ${isOnline ? 'text-[#7bdcb5]' : 'text-[#e2c98a]'}`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'متصل · محفوظ محلياً' : 'بدون إنترنت'}
            </span>
          </div>
          <p className="text-xs text-[#e6f2ec]/80 leading-relaxed">
            تحفظ كافة المعاملات والمهام والوثائق في ذاكرة الجهاز لتبقى متاحة في كل وقت.
          </p>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 pb-24 lg:pb-12">
        <div className="max-w-5xl mx-auto">
          {section === 'home' && (
            <OverviewHome
              onNavigate={handleNavigate}
              transactions={transactions}
              tasks={tasks}
              latestCardName={latestCardTx?.applicantName}
            />
          )}

          {section === 'membership' && (
            <MembershipConditionsView
              onSaveTransaction={handleSaveTransaction}
              onAddTasks={handleAddTasks}
              onNavigate={handleNavigate}
            />
          )}

          {section === 'transfer' && (
            <MembershipTransferView
              onSaveTransaction={handleSaveTransaction}
              onNavigate={handleNavigate}
            />
          )}

          {section === 'international-card' && (
            <InternationalCardWizard
              onSaveTransaction={handleSaveTransaction}
              onNavigate={handleNavigate}
            />
          )}

          {section === 'structure' && (
            <CommitteesFundsBranchesView onSaveTransaction={handleSaveTransaction} />
          )}

          {section === 'support' && (
            <SupportViolationsView
              onSaveTransaction={handleSaveTransaction}
              onNavigate={handleNavigate}
            />
          )}

          {section === 'vault' && (
            <TransactionsTasksView
              transactions={transactions}
              tasks={tasks}
              onUpdateTransactionStatus={handleUpdateTransactionStatus}
              onDeleteTransaction={handleDeleteTransaction}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (syjunion.sy Deep Emerald) */}
      <nav
        aria-label="التنقل السفلي"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#062a1e]/95 backdrop-blur-md border-t border-[#c9a24a]/30 pb-safe text-white"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`h-full flex flex-col items-center justify-center gap-1 transition-colors ${
                  active ? 'text-[#e2c98a]' : 'text-[#e6f2ec]/75'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition-colors ${
                    active ? 'bg-[#04935f]' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold leading-none whitespace-nowrap">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
