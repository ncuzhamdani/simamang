import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { GoalForm } from "../../src/components/GoalForm";
import { listGoals, upsertGoal } from "../../src/lib/queries";

export default function EditGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numId = Number(id);
  const goal = listGoals().find((g) => g.id === numId);
  if (!goal) return null;

  return (
    <GoalForm
      initial={goal}
      onSubmit={(v) => {
        upsertGoal({ id: numId, ...v });
        router.back();
      }}
    />
  );
}
