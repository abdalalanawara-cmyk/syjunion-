import { useState } from 'react';
import {
  CheckSquare,
  Download,
  Eye,
  FileText,
  FolderKanban,
  Plus,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import {
  exportAllUnionData,
  formatArabicDate,
  formatFileSize,
  generateId,
  getLocalStorageUsageKB,
} from '../lib/storage';
import type {
  StoredAttachment,
  TaskCategory,
  TaskPriority,
  TransactionStatus,
  UnionTask,
  UnionTransaction,
} from '../types/union';

interface TransactionsTasksViewProps {
  transactions: UnionTransaction[];
  tasks: UnionTask[];
  onUpdateTransactionStatus: (id: string, status: TransactionStatus) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTask: (task: UnionTask) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

function isStoredAttachment(val: unknown): val is StoredAttachment {
  return (
    typeof val === 'object' &&
    val !== null &&
    'name' in val &&
    'size' in val &&
    typeof (val as StoredAttachment).name === 'string'
  );
}

export function TransactionsTasksView({
  transactions,
  tasks,
  onUpdateTransactionStatus,
  onDeleteTransaction,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TransactionsTasksViewProps) {
  const [viewMode, setViewMode] = useState<'transactions' | 'tasks'>('transactions');
  const [txFilter, setTxFilter] = useState<string>('الكل');
  const [selectedTx, setSelectedTx] = useState<UnionTransaction | null>(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('مهام مهنية');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('متوسط');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'done'>('all');

  const filteredTransactions =
    txFilter === 'الكل'
      ? transactions
      : transactions.filter((t) => t.status === txFilter);

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'done') return t.completed;
    return true;
  });

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const newTask: UnionTask = {
      id: generateId(),
      title: taskTitle.trim(),
      notes: taskNotes.trim() || undefined,
      category: taskCategory,
      priority: taskPriority,
      dueDate: taskDueDate || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    onAddTask(newTask);
    setTaskTitle('');
    setTaskNotes('');
    setTaskDueDate('');
  }

  function handleExportJson() {
    const content = exportAllUnionData();
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sju-offline-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const storageKB = getLocalStorageUsageKB();

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-[#04935f]">
            الذاكرة المحلية للهاتف · يعمل بدون اتصال بالإنترنت
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b2420]">
            سجل المعاملات والمهام الشخصية
          </h1>
          <p className="text-sm text-[#5c6a63] tabular-nums">
            إجمالي المعاملات: {transactions.length} · المهام: {tasks.length} · المساحة المستخدمة محلياً:{' '}
            {storageKB} ك.ب
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportJson}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-[#f3f8f5] text-sm font-bold text-[#0b3d2a] border border-[#e3e9e5] inline-flex items-center gap-2 self-start md:self-auto whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4 text-[#c9a24a]" />
          <span>تصدير نسخة احتياطية (JSON)</span>
        </button>
      </header>

      {/* Main View Switcher */}
      <div className="grid grid-cols-2 gap-3" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'transactions'}
          onClick={() => setViewMode('transactions')}
          className={`min-h-[48px] px-4 rounded-xl border text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors ${
            viewMode === 'transactions'
              ? 'bg-[#0b3d2a] border-[#062a1e] text-[#e2c98a]'
              : 'bg-white border-[#e3e9e5] text-[#1b2420] hover:bg-[#f3f8f5]'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>المعاملات المحفوظة ({transactions.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'tasks'}
          onClick={() => setViewMode('tasks')}
          className={`min-h-[48px] px-4 rounded-xl border text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors ${
            viewMode === 'tasks'
              ? 'bg-[#0b3d2a] border-[#062a1e] text-[#e2c98a]'
              : 'bg-white border-[#e3e9e5] text-[#1b2420] hover:bg-[#f3f8f5]'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>قائمة المهام ({tasks.length})</span>
        </button>
      </div>

      {/* TRANSACTIONS TAB */}
      {viewMode === 'transactions' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['الكل', 'محفوظ محلياً', 'جاهز للتقديم', 'قيد المتابعة', 'مكتمل'] as const).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTxFilter(status)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    txFilter === status
                      ? 'bg-[#04935f] text-white border-[#04935f]'
                      : 'bg-white text-[#5c6a63] border-[#e3e9e5] hover:text-[#1b2420]'
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#e3e9e5] p-10 text-center space-y-2">
              <FileText className="w-8 h-8 text-[#5c6a63] mx-auto" />
              <p className="text-base font-bold text-[#1b2420]">لا توجد معاملات مطابقة حالياً</p>
              <p className="text-sm text-[#5c6a63]">
                عند تقديم أي طلب بطاقة دولية أو تعديل عضوية أو بلاغ، يُحفظ هنا تلقائياً في الذاكرة المحلية.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <article
                  key={tx.id}
                  className="rounded-2xl bg-white border border-[#e3e9e5] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5c6a63] tabular-nums">
                      <span className="font-extrabold text-[#9b7622]">{tx.referenceNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatArabicDate(tx.createdAt)}</span>
                      {tx.branch && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{tx.branch}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-[#1b2420]">{tx.title}</h2>
                    <p className="text-sm text-[#5c6a63]">
                      مقدم الطلب: <span className="text-[#1b2420] font-semibold">{tx.applicantName}</span> — {tx.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <select
                      aria-label={`تغيير حالة المعاملة ${tx.referenceNumber}`}
                      value={tx.status}
                      onChange={(e) =>
                        onUpdateTransactionStatus(tx.id, e.target.value as TransactionStatus)
                      }
                      className="min-h-[40px] px-3 rounded-lg bg-[#e6f2ec] border border-[#04935f]/30 text-xs font-bold text-[#062a1e]"
                    >
                      <option value="محفوظ محلياً">محفوظ محلياً</option>
                      <option value="جاهز للتقديم">جاهز للتقديم</option>
                      <option value="قيد المتابعة">قيد المتابعة</option>
                      <option value="مكتمل">مكتمل</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setSelectedTx(tx)}
                      className="min-h-[40px] px-3.5 rounded-lg bg-[#f3f8f5] hover:bg-[#e6f2ec] border border-[#e3e9e5] text-xs font-bold text-[#0b3d2a] inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>التفاصيل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTransaction(tx.id)}
                      aria-label={`حذف المعاملة ${tx.referenceNumber}`}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-[#fbecea] hover:bg-[#CE1031]/15 text-[#CE1031]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TASKS TAB */}
      {viewMode === 'tasks' && (
        <section className="space-y-5">
          <form
            onSubmit={handleCreateTask}
            className="rounded-2xl bg-white border border-[#e3e9e5] p-5 space-y-4"
          >
            <h2 className="text-base font-bold text-[#1b2420]">إضافة مهمة جديدة إلى الذاكرة المحلية</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="عنوان المهمة (مثال: تصديق وثيقة غير محكوم)..."
                  className="w-full min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
                />
              </div>
              <div className="md:col-span-3">
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                  className="w-full min-h-[44px] px-3 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
                >
                  <option value="وثائق العضوية">وثائق العضوية</option>
                  <option value="البطاقة الدولية">البطاقة الدولية</option>
                  <option value="تعديل العضوية">تعديل العضوية</option>
                  <option value="مهام مهنية">مهام مهنية</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full min-h-[44px] px-3 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
                >
                  <option value="عاجل">عاجل</option>
                  <option value="متوسط">متوسط</option>
                  <option value="عادي">عادي</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420] tabular-nums"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="ملاحظات إضافية (اختياري)..."
                className="flex-1 min-h-[44px] px-3.5 rounded-lg bg-[#f3f8f5] border border-[#e3e9e5] text-sm text-[#1b2420]"
              />
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-lg bg-[#04935f] hover:bg-[#0f5a3c] text-white font-bold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة المهمة</span>
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all' as const, label: `الكل (${tasks.length})` },
              { id: 'pending' as const, label: `قيد التنفيذ (${tasks.filter((t) => !t.completed).length})` },
              { id: 'done' as const, label: `منجزة (${tasks.filter((t) => t.completed).length})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTaskFilter(f.id)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  taskFilter === f.id
                    ? 'bg-[#04935f] text-white border-[#04935f]'
                    : 'bg-white text-[#5c6a63] border-[#e3e9e5]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#e3e9e5] p-10 text-center">
              <p className="text-sm text-[#5c6a63]">لا توجد مهام في هذا التصنيف حالياً.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className={`rounded-2xl border p-4 flex items-start justify-between gap-4 transition-colors ${
                    task.completed
                      ? 'bg-[#f3f8f5] border-[#e3e9e5] opacity-75'
                      : 'bg-white border-[#e3e9e5]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="flex items-start gap-3 text-right flex-1 min-w-0 min-h-[44px]"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-[#04935f] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-5 h-5 text-[#5c6a63] shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 min-w-0">
                      <p
                        className={`text-sm sm:text-base font-bold ${
                          task.completed ? 'line-through text-[#5c6a63]' : 'text-[#1b2420]'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.notes && <p className="text-xs text-[#5c6a63]">{task.notes}</p>}
                      <p className="text-xs font-semibold text-[#0f5a3c] tabular-nums">
                        {task.category} · الأولوية: {task.priority}
                        {task.dueDate ? ` · الموعد: ${task.dueDate}` : ''}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    aria-label={`حذف المهمة ${task.title}`}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-[#fbecea] hover:bg-[#CE1031]/15 text-[#CE1031] shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 bg-[#062a1e]/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-[#e3e9e5] p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#e3e9e5]">
              <div>
                <p className="text-xs font-extrabold text-[#9b7622] tabular-nums">
                  {selectedTx.referenceNumber} · {selectedTx.status}
                </p>
                <h3 className="text-lg font-bold text-[#1b2420] mt-0.5">{selectedTx.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                aria-label="إغلاق"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-[#f3f8f5] text-[#1b2420]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(selectedTx.payload).map(([key, val]) => {
                if (val === undefined || val === null) return null;
                const label = key.replace(/_/g, ' ');
                if (isStoredAttachment(val)) {
                  return (
                    <div
                      key={key}
                      className="rounded-xl bg-[#f3f8f5] border border-[#e3e9e5] p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#5c6a63]">{label}</p>
                        <p className="text-sm font-bold text-[#1b2420] truncate">{val.name}</p>
                        <p className="text-xs text-[#04935f] tabular-nums">
                          {formatFileSize(val.size)}
                        </p>
                      </div>
                      {val.previewDataUrl && (
                        <img
                          src={val.previewDataUrl}
                          alt={val.name}
                          className="w-14 h-14 rounded-lg object-cover border border-[#e3e9e5] shrink-0"
                        />
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={key}
                    className="rounded-xl bg-[#f3f8f5] border border-[#e3e9e5] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                  >
                    <span className="text-xs font-semibold text-[#5c6a63]">{label}</span>
                    <span className="text-sm font-semibold text-[#1b2420] break-words">
                      {String(val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
