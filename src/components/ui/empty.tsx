import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function Empty({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50/60 py-12 px-6 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-white border border-surface-200 grid place-items-center text-surface-400 mb-3">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div className="font-medium">{title}</div>
      {description && (
        <div className="text-sm text-surface-500 mt-1 max-w-md mx-auto">{description}</div>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
