import { cn } from "@/lib/utils";
import React from "react";

interface PageHeaderProps extends React.ComponentProps<"div"> {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)} {...props}>
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}