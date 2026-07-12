import React from "react";
import { router } from "expo-router";
import { AccountForm } from "../../src/components/AccountForm";
import { upsertAccount } from "../../src/lib/queries";

export default function NewAccountScreen() {
  return (
    <AccountForm
      onSubmit={(v) => {
        upsertAccount(v);
        router.back();
      }}
    />
  );
}
