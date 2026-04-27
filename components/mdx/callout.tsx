import { cn } from "@/lib/utils";
import { AlertCircle, Info, AlertTriangle, CheckCircle } from "lucide-react";

const icons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
};

const styles = {
  info: "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400",
  warning: "border-yellow-500/30 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400",
  error: "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400",
  success: "border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400",
};

interface CalloutProps {
  type?: keyof typeof icons;
  children: React.ReactNode;
}

export function Callout({ type = "info", children }: CalloutProps) {
  const Icon = icons[type];
  return (
    <div className={cn("my-6 flex gap-3 rounded-xl border p-4", styles[type])}>
      <Icon className="h-5 w-5 mt-0.5 shrink-0" />
      <div className="text-sm leading-relaxed [&>p]:m-0">{children}</div>
    </div>
  );
}
