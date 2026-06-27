import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "citizen",
  "village_staff",
  "village_chief",
  "district_officer",
  "administrator",
]);

export const recordStatusEnum = pgEnum("record_status", [
  "draft",
  "pending",
  "under_review",
  "approved",
  "rejected",
  "archived",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "pending",
  "verified",
  "rejected",
]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const chiefs = pgTable("chiefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  village: text("village").notNull(),
  district: text("district").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default("citizen"),
  village: text("village"),
  district: text("district"),
  chiefId: uuid("chief_id").references(() => chiefs.id),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const citizens = pgTable("citizens", {
  id: uuid("id").primaryKey().defaultRandom(),
  nationalId: text("national_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  village: text("village").notNull(),
  communityCouncil: text("community_council"),
  district: text("district").notNull(),
  poBox: text("po_box"),
  chiefId: uuid("chief_id")
    .notNull()
    .references(() => chiefs.id),
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("unverified"),
  status: recordStatusEnum("status").notNull().default("draft"),
  registeredAt: timestamp("registered_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const animals = pgTable("animals", {
  id: uuid("id").primaryKey().defaultRandom(),
  tagNumber: text("tag_number").notNull().unique(),
  species: text("species").notNull(),
  breed: text("breed").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => citizens.id),
  village: text("village").notNull(),
  district: text("district").notNull(),
  status: recordStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  registeredAt: timestamp("registered_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const landRecords = pgTable("land_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  parcelNumber: text("parcel_number").notNull().unique(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => citizens.id),
  village: text("village").notNull(),
  communityCouncil: text("community_council").notNull(),
  district: text("district").notNull(),
  landType: text("land_type").notNull(),
  sizeHectares: real("size_hectares").notNull(),
  chiefId: uuid("chief_id")
    .notNull()
    .references(() => chiefs.id),
  status: recordStatusEnum("status").notNull().default("pending"),
  description: text("description"),
  registeredAt: timestamp("registered_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  referenceNumber: text("reference_number").notNull().unique(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  citizenId: uuid("citizen_id")
    .notNull()
    .references(() => citizens.id),
  village: text("village").notNull(),
  district: text("district").notNull(),
  status: recordStatusEnum("status").notNull().default("pending"),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  approvedBy: text("approved_by"),
});

export const disputes = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseNumber: text("case_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  complainantId: uuid("complainant_id")
    .notNull()
    .references(() => citizens.id),
  respondentName: text("respondent_name").notNull(),
  village: text("village").notNull(),
  district: text("district").notNull(),
  chiefId: uuid("chief_id")
    .notNull()
    .references(() => chiefs.id),
  category: text("category").notNull(),
  status: recordStatusEnum("status").notNull().default("pending"),
  filedAt: timestamp("filed_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  read: boolean("read").notNull().default(false),
  href: text("href"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details").notNull(),
  village: text("village"),
  district: text("district"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const residencyRequests = pgTable("residency_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  citizenId: uuid("citizen_id")
    .notNull()
    .references(() => citizens.id),
  chiefId: uuid("chief_id")
    .notNull()
    .references(() => chiefs.id),
  status: verificationStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: text("reviewed_by"),
});
