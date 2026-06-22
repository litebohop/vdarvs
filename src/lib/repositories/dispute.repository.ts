import { appConfig } from "@/config/app.config";
import { mockDisputeRepository } from "@/lib/repositories/mock/dispute.repository";
import { supabaseDisputeRepository } from "@/lib/repositories/supabase/dispute.repository";

export const disputeRepository = appConfig.useMockData
  ? mockDisputeRepository
  : supabaseDisputeRepository;
