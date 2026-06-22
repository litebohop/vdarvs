export const DISTRICTS = [
  "Maseru",
  "Berea",
  "Leribe",
  "Mafeteng",
  "Mohale's Hoek",
  "Quthing",
  "Qacha's Nek",
  "Mokhotlong",
  "Thaba-Tseka",
  "Butha-Buthe",
] as const;

export type District = (typeof DISTRICTS)[number];

export const COMMUNITY_COUNCILS: Record<District, string[]> = {
  Maseru: ["Maseru Central", "Maseru West", "Roma", "Teyateyaneng"],
  Berea: ["Teyateyaneng", "Khubetsoana", "Mapoteng"],
  Leribe: ["Hlotse", "Maputsoe", "Kolonyama"],
  Mafeteng: ["Mafeteng Urban", "Matelile", "Qalabane"],
  "Mohale's Hoek": ["Mohale's Hoek", "Quthing Road", "Mpharane"],
  Quthing: ["Quthing", "Mount Moorosi", "Qacha's Nek Road"],
  "Qacha's Nek": ["Qacha's Nek", "Sehlabathebe", "Matsieng"],
  Mokhotlong: ["Mokhotlong", "Sanqebethu", "Tlokoeng"],
  "Thaba-Tseka": ["Thaba-Tseka", "Mantsonyane", "Semenanyane"],
  "Butha-Buthe": ["Butha-Buthe", "Motete", "Qalo"],
};

export const VILLAGES: Record<string, string[]> = {
  "Maseru Central": ["Masianokeng", "Ha Tsolo", "Ha Ramokoatsi", "Seoli"],
  "Maseru West": ["Motse-Mocha", "Lithabaneng", "Qoaling"],
  Roma: ["Roma", "Ha Thetsane", "Mazenod"],
  Teyateyaneng: ["Teyateyaneng", "Ha Abia", "Ha Koali"],
  Hlotse: ["Hlotse", "Ha Leqele", "Pitseng"],
  Maputsoe: ["Maputsoe", "Ha Foso", "Ha Mabote"],
};

export const COUNTRY = "Lesotho";
