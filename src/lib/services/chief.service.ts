import type { Chief } from "@/types/entities.types";
import { chiefRepository } from "@/lib/repositories/chief.repository";

export const chiefService = {
  getChiefs() {
    return chiefRepository.findAll();
  },

  /**
   * Picks the chief responsible for a location. Prefers a village match,
   * then a district match, then the first available chief. Returns null when
   * no chiefs exist so callers can surface a clear error.
   */
  resolveChiefForLocation(
    chiefs: Chief[],
    village: string,
    district: string,
  ): Chief | null {
    return (
      chiefs.find((c) => c.village === village) ??
      chiefs.find((c) => c.district === district) ??
      chiefs[0] ??
      null
    );
  },
};
