import { appConfig } from "@/config/app.config";
import { mockDocumentRepository } from "@/lib/repositories/mock/document.repository";
import { supabaseDocumentRepository } from "@/lib/repositories/supabase/document.repository";

export const documentRepository = appConfig.useMockData
  ? mockDocumentRepository
  : supabaseDocumentRepository;
