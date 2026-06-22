import type { Citizen, ResidencyRequest } from "@/types/entities.types";
import type {
  Animal,
  LandRecord,
  Document,
  Dispute,
  Notification,
  AuditLog,
} from "@/types/entities.types";

export type DbCitizen = {
  id: string;
  national_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  phone: string;
  email: string | null;
  village: string;
  community_council: string | null;
  district: string;
  po_box: string | null;
  chief_id: string;
  verification_status: Citizen["verificationStatus"];
  status: Citizen["status"];
  registered_at: string;
  updated_at: string;
};

export type DbResidencyRequest = {
  id: string;
  citizen_id: string;
  chief_id: string;
  status: ResidencyRequest["status"];
  notes: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  citizens?: Pick<DbCitizen, "first_name" | "last_name" | "national_id" | "village" | "district">;
};

export function mapCitizen(row: DbCitizen): Citizen {
  return {
    id: row.id,
    nationalId: row.national_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    phone: row.phone,
    email: row.email ?? undefined,
    address: {
      village: row.village,
      communityCouncil: row.community_council ?? undefined,
      district: row.district,
      poBox: row.po_box ?? undefined,
    },
    chiefId: row.chief_id,
    verificationStatus: row.verification_status,
    status: row.status,
    registeredAt: row.registered_at,
    updatedAt: row.updated_at,
  };
}

export function mapResidencyRequest(row: DbResidencyRequest): ResidencyRequest {
  const citizen = row.citizens;
  return {
    id: row.id,
    citizenId: row.citizen_id,
    citizenName: citizen
      ? `${citizen.first_name} ${citizen.last_name}`
      : "Unknown",
    nationalId: citizen?.national_id ?? "",
    village: citizen?.village ?? "",
    district: citizen?.district ?? "",
    chiefId: row.chief_id,
    status: row.status,
    requestedAt: row.requested_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export type DbAnimal = {
  id: string;
  tag_number: string;
  species: Animal["species"];
  breed: string;
  owner_id: string;
  village: string;
  district: string;
  status: Animal["status"];
  notes: string | null;
  registered_at: string;
  citizens?: { first_name: string; last_name: string };
};

export function mapAnimal(row: DbAnimal): Animal {
  return {
    id: row.id,
    tagNumber: row.tag_number,
    species: row.species,
    breed: row.breed,
    ownerId: row.owner_id,
    ownerName: row.citizens
      ? `${row.citizens.first_name} ${row.citizens.last_name}`
      : "Unknown",
    village: row.village,
    district: row.district,
    status: row.status,
    notes: row.notes ?? undefined,
    registeredAt: row.registered_at,
  };
}

export type DbLandRecord = {
  id: string;
  parcel_number: string;
  owner_id: string;
  village: string;
  community_council: string;
  district: string;
  land_type: LandRecord["landType"];
  size_hectares: number;
  chief_id: string;
  status: LandRecord["status"];
  description: string | null;
  registered_at: string;
  citizens?: { first_name: string; last_name: string };
};

export function mapLandRecord(row: DbLandRecord): LandRecord {
  return {
    id: row.id,
    parcelNumber: row.parcel_number,
    ownerId: row.owner_id,
    ownerName: row.citizens
      ? `${row.citizens.first_name} ${row.citizens.last_name}`
      : "Unknown",
    village: row.village,
    communityCouncil: row.community_council,
    district: row.district,
    landType: row.land_type,
    sizeHectares: row.size_hectares,
    chiefId: row.chief_id,
    status: row.status,
    description: row.description ?? undefined,
    registeredAt: row.registered_at,
  };
}

export type DbDocument = {
  id: string;
  reference_number: string;
  type: Document["type"];
  title: string;
  citizen_id: string;
  village: string;
  district: string;
  status: Document["status"];
  issued_at: string | null;
  requested_at: string;
  approved_by: string | null;
  citizens?: { first_name: string; last_name: string };
};

export function mapDocument(row: DbDocument): Document {
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    type: row.type,
    title: row.title,
    citizenId: row.citizen_id,
    citizenName: row.citizens
      ? `${row.citizens.first_name} ${row.citizens.last_name}`
      : "Unknown",
    village: row.village,
    district: row.district,
    status: row.status,
    issuedAt: row.issued_at ?? undefined,
    requestedAt: row.requested_at,
    approvedBy: row.approved_by ?? undefined,
  };
}

export type DbDispute = {
  id: string;
  case_number: string;
  title: string;
  description: string;
  complainant_id: string;
  respondent_name: string;
  village: string;
  district: string;
  chief_id: string;
  category: Dispute["category"];
  status: Dispute["status"];
  filed_at: string;
  resolved_at: string | null;
  citizens?: { first_name: string; last_name: string };
};

export function mapDispute(row: DbDispute): Dispute {
  return {
    id: row.id,
    caseNumber: row.case_number,
    title: row.title,
    description: row.description,
    complainantId: row.complainant_id,
    complainantName: row.citizens
      ? `${row.citizens.first_name} ${row.citizens.last_name}`
      : "Unknown",
    respondentName: row.respondent_name,
    village: row.village,
    district: row.district,
    chiefId: row.chief_id,
    category: row.category,
    status: row.status,
    filedAt: row.filed_at,
    resolvedAt: row.resolved_at ?? undefined,
  };
}

export type DbNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: Notification["type"];
  read: boolean;
  href: string | null;
  created_at: string;
};

export function mapNotification(row: DbNotification): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    createdAt: row.created_at,
    href: row.href ?? undefined,
  };
}

export type DbAuditLog = {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id: string;
  details: string;
  village: string | null;
  district: string | null;
  created_at: string;
};

export function mapAuditLog(row: DbAuditLog): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id,
    details: row.details,
    village: row.village ?? undefined,
    district: row.district ?? undefined,
    createdAt: row.created_at,
  };
}
