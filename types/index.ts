export interface SetData {
  id?: string;
  set_number: number;
  weight: number;
  reps: number;
  reps_to_failure: number; // 👈 الميزة الجديدة
  is_completed?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: SetData[];
}