import { appConfig } from "@/config/app.config";
import { mockLandRepository } from "@/lib/repositories/mock/land.repository";
import { supabaseLandRepository } from "@/lib/repositories/supabase/land.repository";

export const landRepository = appConfig.useMockData
  ? mockLandRepository
  : supabaseLandRepository;
