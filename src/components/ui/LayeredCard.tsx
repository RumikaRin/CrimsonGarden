"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LayeredCardProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "form";
  onClick?: () => void;
  hover?: boolean;
  offset?: number;
}

export function LayeredCard({
  children,
  className,
  as: Tag = "div",
  onClick,
  hover = false,
  offset,
}: LayeredCardProps) {
  return (
    <Tag
      className={cn(
        "card-layered",
        hover && "hover:cursor-pointer hover:-translate-y-1 hover:translate-x-1 transition-all duration-250",
        onClick && "cursor-pointer",
        className
      )}
      style={offset ? { "--offset-distance": offset + "px" } as React.CSSProperties : undefined}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === "Enter") onClick(); } : undefined}
    >
      {children}
    </Tag>
  );
}

export function LayeredPanel({
  children,
  className,
  title,
  icon,
  as: Tag = "section",
}: LayeredCardProps & { title?: string; icon?: React.ReactNode }) {
  return (
    <LayeredCard as={Tag} className={cn("p-6 sm:p-8", className)} hover>
      {title && (
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[var(--border-default)]">
          {icon && <span className="text-[var(--forest)]">{icon}</span>}
          <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        </div>
      )}
      {children}
    </LayeredCard>
  );
}
