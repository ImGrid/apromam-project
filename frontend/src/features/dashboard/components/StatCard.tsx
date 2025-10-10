/**
 * Tarjeta de estadistica reutilizable
 * Muestra numero, label, icono y trend opcional
 */

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: "primary" | "success" | "warning" | "error" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  loading?: boolean;
}

const colorClasses = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  error: "text-error bg-error/10",
  info: "text-info bg-info/10",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "primary",
  trend,
  loading = false,
}: StatCardProps) {
  return (
    <div className="p-6 transition-shadow bg-white border rounded-lg border-neutral-border hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary">{title}</p>

          {loading ? (
            <div className="w-24 h-10 mt-2 rounded bg-neutral-bg animate-pulse" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
          )}

          {trend && !loading && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-error" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-success" : "text-error"
                }`}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-text-secondary">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
