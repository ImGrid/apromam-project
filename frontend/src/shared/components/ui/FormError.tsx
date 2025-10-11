import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className = "" }: FormErrorProps) {
  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 p-4 
        bg-error/10 border border-error/20 rounded-lg
        text-error
        animate-in slide-in-from-top-2 duration-300
        ${className}
      `}
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
