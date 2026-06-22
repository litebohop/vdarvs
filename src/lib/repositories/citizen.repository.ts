import { appConfig } from "@/config/app.config";
import { mockCitizenRepository } from "@/lib/repositories/mock/citizen.repository";
import { supabaseCitizenRepository } from "@/lib/repositories/supabase/citizen.repository";

export const citizenRepository = appConfig.useMockData
  ? mockCitizenRepository
  : supabaseCitizenRepository;
