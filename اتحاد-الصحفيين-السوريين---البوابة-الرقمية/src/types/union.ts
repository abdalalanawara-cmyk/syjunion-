export type AppSection =
  | 'home'
  | 'membership'
  | 'transfer'
  | 'international-card'
  | 'structure'
  | 'support'
  | 'vault';

export type TransactionType =
  | 'international-card'
  | 'membership-transfer'
  | 'membership-prep'
  | 'violation-report'
  | 'complaint'
  | 'contact'
  | 'committee-request'
  | 'fund-request';

export type TransactionStatus =
  | 'محفوظ محلياً'
  | 'جاهز للتقديم'
  | 'قيد المتابعة'
  | 'مكتمل';

export interface StoredAttachment {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  previewDataUrl?: string;
}

export interface UnionTransaction {
  id: string;
  referenceNumber: string;
  type: TransactionType;
  title: string;
  applicantName: string;
  branch?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  summary: string;
  payload: Record<string, string | number | boolean | StoredAttachment | null | undefined>;
}

export type TaskPriority = 'عاجل' | 'متوسط' | 'عادي';
export type TaskCategory = 'وثائق العضوية' | 'البطاقة الدولية' | 'تعديل العضوية' | 'مهام مهنية';

export interface UnionTask {
  id: string;
  title: string;
  notes?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface InternationalCardDraft {
  step: 1 | 2 | 3;
  fullNameAr: string;
  fullNameEn: string;
  birthDate: string;
  nationality: 'سوري' | 'فلسطيني سوري' | '';
  phone: string;
  email: string;
  membershipNumber: string;
  branch: string;
  requestType: 'إصدار لأول مرة' | 'تجديد' | 'بدل ضائع أو تالف' | '';
  mediaOrganization: string;
  jobTitle: string;
  experienceYears: string;
  previousCardNumber: string;
  personalPhoto: StoredAttachment | null;
  membershipCardPhoto: StoredAttachment | null;
  idOrPassportPhoto: StoredAttachment | null;
  confirmProfessionalMember: boolean;
  confirmAccuracyAndContact: boolean;
}

export interface MembershipTransferDraft {
  fullName: string;
  membershipNumber: string;
  branch: string;
  trainingStartDate: string;
  examPassDate: string;
  mediaOrganization: string;
  phone: string;
  notes: string;
  membershipCardPhoto: StoredAttachment | null;
  trainingProofDoc: StoredAttachment | null;
  recentPhoto: StoredAttachment | null;
  confirmCompleted: boolean;
}

export interface MembershipPrepDraft {
  fullName: string;
  phone: string;
  branch: string;
  eligibilityChecks: {
    syrianOrPalestinian: boolean;
    ageBetween20And60: boolean;
    highSchoolOrEquivalent: boolean;
    cleanCriminalRecord: boolean;
    goodConduct: boolean;
    notDismissed: boolean;
    journalismPrimaryWork: boolean;
  };
  notes: string;
}

export interface ViolationReportDraft {
  reporterName: string;
  phone: string;
  journalistName: string;
  governorate: string;
  incidentDate: string;
  violationType: string;
  mediaEntity: string;
  description: string;
  evidenceFile: StoredAttachment | null;
  confidential: boolean;
}

export interface ComplaintDraft {
  complainantName: string;
  membershipNumber: string;
  phone: string;
  branch: string;
  complaintCategory: string;
  targetEntity: string;
  details: string;
  attachment: StoredAttachment | null;
}

export interface ContactDraft {
  senderName: string;
  email: string;
  phone: string;
  subject: string;
  targetCenter: string;
  message: string;
}
