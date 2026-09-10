"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SetData } from "@/types";
import { SetRow } from "./SetRow";

export function WorkoutLogger({ exerciseId }: { exerciseId?: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [sets, setSets] = useState<SetData[]>([
    { set_number: 1, weight: 0, reps: 0, reps_to_failure: 0 },
  ]);

  const addSet = () => {
    setSets((prev) => [
      ...prev,
      { set_number: prev.length + 1, weight: 0, reps: 0, reps_to_failure: 0 },
    ]);
  };

  const updateSet = (index: number, field: string, value: number) => {
    setSets((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const saveWorkout = async () => {
    setLoading(true);
    try {
      const payload = sets.map((s) => ({
        exercise_id: exerciseId || null,
        set_number: s.set_number,
        weight: s.weight,
        reps: s.reps,
        reps_to_failure: s.reps_to_failure,
      }));

      const { data, error } = await supabase.from("sets").insert(payload);

      if (error) throw error;
      alert("تم حفظ التمرينة بنجاح! 💪");
    } catch (err: any) {
      console.error(err);
      alert("حدث خطأ أثناء الحفظ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-background rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">تسجيل التمرين</h2>

      {sets.map((set, index) => (
        <SetRow
          key={index}
          setIndex={index}
          weight={set.weight}
          reps={set.reps}
          repsToFailure={set.reps_to_failure}
          onUpdate={(field, val) => updateSet(index, field, val)}
        />
      ))}

      <div className="flex gap-2 mt-4">
        <button
          onClick={addSet}
          className="flex-1 py-2 px-4 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/10 transition"
        >
          + إضافة شوط
        </button>

        <button
          onClick={saveWorkout}
          disabled={loading}
          className="flex-1 py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "جاري الحفظ..." : "حفظ الجلسة"}
        </button>
      </div>
    </div>
  );
}