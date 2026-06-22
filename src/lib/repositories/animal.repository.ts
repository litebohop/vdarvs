import { appConfig } from "@/config/app.config";
import { mockAnimalRepository } from "@/lib/repositories/mock/animal.repository";
import { supabaseAnimalRepository } from "@/lib/repositories/supabase/animal.repository";

export const animalRepository = appConfig.useMockData
  ? mockAnimalRepository
  : supabaseAnimalRepository;
