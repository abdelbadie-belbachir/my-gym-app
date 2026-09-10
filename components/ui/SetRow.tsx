import React from "react";

interface SetRowProps {
  setIndex: number;
  weight: number;
  reps: number;
  repsToFailure: number;
  onUpdate: (field: string, value: number) => void;
}

export function SetRow({
  setIndex,
  weight,
  reps,
  repsToFailure,
  onUpdate,
}: SetRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-card border shadow-sm mb-2">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold text-muted-foreground">
        #{setIndex + 1}
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <label className="text-[10px] font-medium text-muted-foreground text-center">
          الوزن (kg)
        </label>
        <input
          type="number"
          placeholder="0"
          value={weight || ""}
          onChange={(e) => onUpdate("weight", parseFloat(e.target.value) || 0)}
          className="w-full h-9 px-1 text-center text-sm font-semibold rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <label className="text-[10px] font-medium text-muted-foreground text-center">
          التكرارات
        </label>
        <input
          type="number"
          placeholder="0"
          value={reps || ""}
          onChange={(e) => onUpdate("reps", parseInt(e.target.value) || 0)}
          className="w-full h-9 px-1 text-center text-sm font-semibold rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <label className="text-[10px] font-bold text-amber-500 text-center">
          باقي للفشل
        </label>
        <input
          type="number"
          min="0"
          max="5"
          placeholder="0"
          value={repsToFailure ?? 0}
          onChange={(e) =>
            onUpdate("reps_to_failure", parseInt(e.target.value) || 0)
          }
          className="w-full h-9 px-1 text-center text-sm font-bold text-amber-500 rounded-md border border-amber-500/50 bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
    </div>
  );
}