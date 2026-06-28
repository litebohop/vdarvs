import type { UserRole } from "@/types/common.types";
import type { VillageAddress } from "@/types/common.types";
import type { RecordStatus, VerificationStatus } from "@/types/common.types";

export interface Citizen {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  phone: string;
  email?: string;
  address: VillageAddress;
  chiefId: string;
  verificationStatus: VerificationStatus;
  status: RecordStatus;
  registeredAt: string;
  updatedAt: string;
}

export interface Animal {
  id: string;
  tagNumber: string;
  species: "cattle" | "sheep" | "goat" | "horse" | "donkey" | "poultry";
  breed: string;
  ownerId: string;
  ownerName: string;
  village: string;
  district: string;
  registeredAt: string;
  status: RecordStatus;
  notes?: string;
}

export interface LandRecord {
  id: string;
  parcelNumber: string;
  ownerId: string;
  ownerName: string;
  village: string;
  communityCouncil: string;
  district: string;
  landType: "residential" | "agricultural" | "communal" | "grazing";
  sizeHectares: number;
  chiefId: string;
  status: RecordStatus;
  registeredAt: string;
  description?: string;
}

export interface Document {
  id: string;
  referenceNumber: string;
  type:
    | "residency_certificate"
    | "birth_record"
    | "land_title"
    | "animal_permit"
    | "chief_endorsement"
    | "dispute_ruling";
  title: string;
  citizenId: string;
  citizenName: string;
  village: string;
  district: string;
  status: RecordStatus;
  issuedAt?: string;
  requestedAt: string;
  approvedBy?: string;
}

export interface Dispute {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  complainantId: string;
  complainantName: string;
  respondentName: string;
  village: string;
  district: string;
  chiefId: string;
  category: "land" | "livestock" | "boundary" | "family" | "other";
  status: RecordStatus;
  filedAt: string;
  resolvedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "action";
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  village?: string;
  district?: string;
  createdAt: string;
}

export interface Chief {
  id: string;
  name: string;
  village: string;
  district: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  village?: string;
  district?: string;
  chiefId?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCitizens: number;
  pendingVerifications: number;
  activeDisputes: number;
  documentsIssued: number;
  registeredAnimals: number;
  landParcels: number;
  pendingApprovals: number;
}

export interface CitizenDashboardSummary {
  citizen: Citizen | null;
  pendingDocuments: number;
  approvedDocuments: number;
  activeDisputes: number;
  unreadNotifications: number;
  recentDocuments: Document[];
  recentNotifications: Notification[];
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status?: RecordStatus;
}

export interface ChartDataPoint {
  month: string;
  citizens: number;
  documents: number;
  disputes: number;
}

export interface ResidencyRequest {
  id: string;
  citizenId: string;
  citizenName: string;
  nationalId: string;
  village: string;
  district: string;
  chiefId: string;
  status: VerificationStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface RoleRequest {
  id: string;
  userId: string;
  requestedRole: UserRole;
  reason: string;
  village?: string;
  district?: string;
  status: RecordStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
