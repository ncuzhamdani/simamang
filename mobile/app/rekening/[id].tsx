import React from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AccountForm } from "../../src/components/AccountForm";
import { deleteAccount, getAccount, upsertAccount } from "../../src/lib/queries";

export default function EditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numId = Number(id);
  const acc = getAccount(numId);
  if (!acc) return null;

  return (
    <AccountForm
      initial={acc}
      onSubmit={(v) => {
        upsertAccount({ id: numId, ...v });
        router.back();
      }}
      onDelete={() =>
        Alert.alert("Hapus rekening?", "Rekening dan seluruh transaksinya akan dihapus.", [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus",
            style: "destructive",
            onPress: () => {
              deleteAccount(numId);
              router.back();
            },
          },
        ])
      }
    />
  );
}
