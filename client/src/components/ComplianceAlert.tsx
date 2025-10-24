import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceAlertProps {
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
}

export default function ComplianceAlert({ type, title, message }: ComplianceAlertProps) {
  const config = {
    success: {
      icon: CheckCircle2,
      className: "border-success/50 bg-success/5 text-success",
      iconColor: "text-success"
    },
    warning: {
      icon: AlertTriangle,
      className: "border-warning/50 bg-warning/5 text-warning",
      iconColor: "text-warning"
    },
    error: {
      icon: XCircle,
      className: "border-error/50 bg-error/5 text-error",
      iconColor: "text-error"
    },
    info: {
      icon: Info,
      className: "border-info/50 bg-info/5 text-info",
      iconColor: "text-info"
    }
  };

  const { icon: Icon, className, iconColor } = config[type];

  return (
    <Alert className={cn("border-l-4", className)} data-testid={`alert-${type}`}>
      <Icon className={cn("h-5 w-5", iconColor)} />
      <AlertTitle className="font-semibold text-foreground">{title}</AlertTitle>
      <AlertDescription className="text-sm text-foreground/90">
        {message}
      </AlertDescription>
    </Alert>
  );
}
