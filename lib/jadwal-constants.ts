export const HARI: string[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export interface SlotWaktu {
  mulai: string;
  selesai: string;
}

export const SLOT_WAKTU: SlotWaktu[] = [
  { mulai: "07.00", selesai: "08.30" },
  { mulai: "08.30", selesai: "10.00" },
  { mulai: "10.15", selesai: "11.45" },
  { mulai: "12.30", selesai: "14.00" },
  { mulai: "14.00", selesai: "15.30" },
];

export const JAM_PER_SLOT = 1.5;
export const TARGET_JAM_MINGGU = 24;
