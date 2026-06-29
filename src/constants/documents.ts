import type { Document } from "@/types/entities.types";

export const DOCUMENT_TYPES: {
  value: Document["type"];
  label: string;
}[] = [
  { value: "residency_certificate", label: "Residency Certificate" },
  { value: "birth_record", label: "Birth Record" },
  { value: "land_title", label: "Land Title" },
  { value: "animal_permit", label: "Animal Permit" },
  { value: "chief_endorsement", label: "Chief Endorsement" },
  { value: "dispute_ruling", label: "Dispute Ruling" },
];
