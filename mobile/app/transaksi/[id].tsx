import React from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { TransactionForm } from "../../src/components/TransactionForm";
import { deleteTransaction, getTransaction, upsertTransaction } from "../../src/lib/queries";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numId = Number(id);
  const tx = getTransaction(numId);
  if (!tx) {
    return null;
  }
  return (
    <TransactionForm
      initial={tx}
      onDelete={() =>
        Alert.alert("Hapus transaksi?", undefined, [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus",
            style: "destructive",
            onPress: () => {
              deleteTransaction(numId);
              router.back();
            },
          },
        ])
      }
      onSubmit={(v) => {
        upsertTransaction({
          id: numId,
          type: v.type,
          amount: v.amount,
          account_id: v.account_id,
          to_account_id: v.to_account_id,
          category_id: v.category_id,
          occurred_at: v.occurred_at,
          note: v.note,
          tags: v.tags,
        });
        router.back();
      }}
    />
  );
}
