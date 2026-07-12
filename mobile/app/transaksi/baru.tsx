import React from "react";
import { router } from "expo-router";
import { TransactionForm } from "../../src/components/TransactionForm";
import { upsertTransaction } from "../../src/lib/queries";
import { nowIso } from "../../src/lib/format";

export default function NewTransactionScreen() {
  return (
    <TransactionForm
      onSubmit={(v) => {
        upsertTransaction({
          type: v.type,
          amount: v.amount,
          account_id: v.account_id,
          to_account_id: v.to_account_id,
          category_id: v.category_id,
          occurred_at: v.occurred_at || nowIso(),
          note: v.note,
          tags: v.tags,
        });
        router.back();
      }}
    />
  );
}
