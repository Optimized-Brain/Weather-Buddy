import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WeatherCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export default function WeatherCard({ title, description, icon, children, className, footer }: WeatherCardProps) {
  return (
    <Card className={cn("shadow-lg backdrop-blur-sm bg-card/80 hover:shadow-xl transition-shadow duration-300", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          {icon && <div className="text-3xl text-primary">{icon}</div>}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <div className="px-6 pb-4 pt-0 text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </Card>
  );
}
