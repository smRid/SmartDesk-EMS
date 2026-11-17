import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: string;
  title?: string;
};

export function SectionCard({ action, children, className, contentClassName, description, title }: SectionCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {title || description || action ? (
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
          <div className="space-y-1">
            {title ? <CardTitle className="text-lg">{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {action}
        </CardHeader>
      ) : null}
      <CardContent className={cn("p-5 sm:p-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
