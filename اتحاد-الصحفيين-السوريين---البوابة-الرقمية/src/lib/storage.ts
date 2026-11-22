import type {
  AppSection,
  ComplaintDraft,
  ContactDraft,
  InternationalCardDraft,
  MembershipPrepDraft,
  MembershipTransferDraft,
  StoredAttachment,
  UnionTask,
  UnionTransaction,
  ViolationReportDraft,
} from '../types/union';
import { INITIAL_TASKS } from '../data/unionContent';

const KEYS = {
  TRANSACTIONS: 'sju_transactions_v1',
  TASKS: 'sju_tasks_v1',
  ACTIVE_SECTION: 'sju_active_section_v1',
  INTL_CARD_DRAFT: 'sju_intl_card_draft_v1',
  TRANSFER_DRAFT: 'sju_transfer_draft_v1',
  MEMBERSHIP_PREP_DRAFT: 'sju_membership_prep_draft_v1',
  VIOLATION_DRAFT: 'sju_violation_draft_v1',
  COMPLAINT_DRAFT: 'sju_complaint_draft_v1',
  CONTACT_DRAFT: 'sju_contact_draft_v1',
} as const;

export const DEFAULT_INTL_CARD_DRAFT: InternationalCardDraft = {
  step: 1,
  fullNameAr: '',
  fullNameEn: '',
  birthDate: '',
  nationality: '',
  phone: '',
  email: '',
  membershipNumber: '',
  branch: '',
  requestType: '',
  mediaOrganization: '',
  jobTitle: '',
  experienceYears: '',
  previousCardNumber: '',
  personalPhoto: null,
  membershipCardPhoto: null,
  idOrPassportPhoto: null,
  confirmProfessionalMember: false,
  confirmAccuracyAndContact: false,
};

export const DEFAULT_TRANSFER_DRAFT: MembershipTransferDraft = {
  fullName: '',
  membershipNumber: '',
  branch: '',
  trainingStartDate: '',
  examPassDate: '',
  mediaOrganization: '',
  phone: '',
  notes: '',
  membershipCardPhoto: null,
  trainingProofDoc: null,
  recentPhoto: null,
  confirmCompleted: false,
};

export const DEFAULT_MEMBERSHIP_PREP_DRAFT: MembershipPrepDraft = {
  fullName: '',
  phone: '',
  branch: '',
  eligibilityChecks: {
    syrianOrPalestinian: true,
    ageBetween20And60: true,
    highSchoolOrEquivalent: true,
    cleanCriminalRecord: true,
    goodConduct: true,
    notDismissed: true,
    journalismPrimaryWork: true,
  },
  notes: '',
};

export const DEFAULT_VIOLATION_DRAFT: ViolationReportDraft = {
  reporterName: '',
  phone: '',
  journalistName: '',
  governorate: '',
  incidentDate: '',
  violationType: '',
  mediaEntity: '',
  description: '',
  evidenceFile: null,
  confidential: true,
};

export const DEFAULT_COMPLAINT_DRAFT: ComplaintDraft = {
  complainantName: '',
  membershipNumber: '',
  phone: '',
  branch: '',
  complaintCategory: '',
  targetEntity: '',
  details: '',
  attachment: null,
};

export const DEFAULT_CONTACT_DRAFT: ContactDraft = {
  senderName: '',
  email: '',
  phone: '',
  subject: '',
  targetCenter: 'المقر المركزي - دمشق',
  message: '',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Strip heavy base64 previews if storage quota is tight, then retry
    try {
      const stripped = JSON.stringify(value, (k, v) => (k === 'previewDataUrl' ? undefined : v));
      window.localStorage.setItem(key, stripped);
      return true;
    } catch {
      return false;
    }
  }
}

export function generateReferenceNumber(prefix = 'SJU'): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${rand}`;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function fileToStoredAttachment(file: File): Promise<StoredAttachment> {
  const base: StoredAttachment = {
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    lastModified: file.lastModified,
  };

  if (file.type.startsWith('image/') && file.size <= 450 * 1024) {
    try {
      const previewDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(new Error('read error'));
        reader.readAsDataURL(file);
      });
      if (previewDataUrl) {
        return { ...base, previewDataUrl };
      }
    } catch {
      return base;
    }
  }

  return base;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} م.ب`;
}

export function formatArabicDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-SY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

// Active section
export function loadActiveSection(): AppSection {
  return safeRead<AppSection>(KEYS.ACTIVE_SECTION, 'home');
}

export function saveActiveSection(section: AppSection): void {
  safeWrite(KEYS.ACTIVE_SECTION, section);
}

// Transactions
export function loadTransactions(): UnionTransaction[] {
  return safeRead<UnionTransaction[]>(KEYS.TRANSACTIONS, []);
}

export function saveTransactions(list: UnionTransaction[]): boolean {
  return safeWrite(KEYS.TRANSACTIONS, list);
}

// Tasks
export function loadTasks(): UnionTask[] {
  const existing = safeRead<UnionTask[] | null>(KEYS.TASKS, null);
  if (existing === null) {
    safeWrite(KEYS.TASKS, INITIAL_TASKS);
    return INITIAL_TASKS;
  }
  return existing;
}

export function saveTasks(list: UnionTask[]): boolean {
  return safeWrite(KEYS.TASKS, list);
}

// Drafts
export function loadIntlCardDraft(): InternationalCardDraft {
  return { ...DEFAULT_INTL_CARD_DRAFT, ...safeRead<Partial<InternationalCardDraft>>(KEYS.INTL_CARD_DRAFT, {}) };
}

export function saveIntlCardDraft(draft: InternationalCardDraft): void {
  safeWrite(KEYS.INTL_CARD_DRAFT, draft);
}

export function loadTransferDraft(): MembershipTransferDraft {
  return { ...DEFAULT_TRANSFER_DRAFT, ...safeRead<Partial<MembershipTransferDraft>>(KEYS.TRANSFER_DRAFT, {}) };
}

export function saveTransferDraft(draft: MembershipTransferDraft): void {
  safeWrite(KEYS.TRANSFER_DRAFT, draft);
}

export function loadMembershipPrepDraft(): MembershipPrepDraft {
  const stored = safeRead<Partial<MembershipPrepDraft>>(KEYS.MEMBERSHIP_PREP_DRAFT, {});
  return {
    ...DEFAULT_MEMBERSHIP_PREP_DRAFT,
    ...stored,
    eligibilityChecks: {
      ...DEFAULT_MEMBERSHIP_PREP_DRAFT.eligibilityChecks,
      ...(stored.eligibilityChecks ?? {}),
    },
  };
}

export function saveMembershipPrepDraft(draft: MembershipPrepDraft): void {
  safeWrite(KEYS.MEMBERSHIP_PREP_DRAFT, draft);
}

export function loadViolationDraft(): ViolationReportDraft {
  return { ...DEFAULT_VIOLATION_DRAFT, ...safeRead<Partial<ViolationReportDraft>>(KEYS.VIOLATION_DRAFT, {}) };
}

export function saveViolationDraft(draft: ViolationReportDraft): void {
  safeWrite(KEYS.VIOLATION_DRAFT, draft);
}

export function loadComplaintDraft(): ComplaintDraft {
  return { ...DEFAULT_COMPLAINT_DRAFT, ...safeRead<Partial<ComplaintDraft>>(KEYS.COMPLAINT_DRAFT, {}) };
}

export function saveComplaintDraft(draft: ComplaintDraft): void {
  safeWrite(KEYS.COMPLAINT_DRAFT, draft);
}

export function loadContactDraft(): ContactDraft {
  return { ...DEFAULT_CONTACT_DRAFT, ...safeRead<Partial<ContactDraft>>(KEYS.CONTACT_DRAFT, {}) };
}

export function saveContactDraft(draft: ContactDraft): void {
  safeWrite(KEYS.CONTACT_DRAFT, draft);
}

export function getLocalStorageUsageKB(): number {
  try {
    let totalBytes = 0;
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('sju_')) {
        const v = window.localStorage.getItem(k) ?? '';
        totalBytes += (k.length + v.length) * 2;
      }
    }
    return Math.round((totalBytes / 1024) * 10) / 10;
  } catch {
    return 0;
  }
}

export function exportAllUnionData(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      source: 'اتحاد الصحفيين السوريين - الذاكرة المحلية',
      transactions: loadTransactions(),
      tasks: loadTasks(),
    },
    null,
    2
  );
}
