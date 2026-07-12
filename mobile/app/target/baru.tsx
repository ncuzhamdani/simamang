import React from "react";
import { router } from "expo-router";
import { GoalForm } from "../../src/components/GoalForm";
import { upsertGoal } from "../../src/lib/queries";

export default function NewGoalScreen() {
  return (
    <GoalForm
      onSubmit={(v) => {
        upsertGoal(v);
        router.back();
      }}
    />
  );
}
