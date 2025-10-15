import { forwardRef, type InputHTMLAttributes } from "react";

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className = "", disabled, checked, ...props }, ref) => {
    return (
      <div className={className}>
        <label
          className={`
            inline-flex items-center gap-3 cursor-pointer
            min-h-[44px] touch-target
            ${disabled ? "cursor-not-allowed opacity-60" : ""}
          `}
        >
          <div className="relative flex items-center justify-center flex-shrink-0">
            {/* Hidden native radio */}
            <input
              ref={ref}
              type="radio"
              disabled={disabled}
              checked={checked}
              className="sr-only peer"
              {...props}
            />

            {/* Custom radio visual */}
            <div
              className={`
                w-5 h-5 border-2 rounded-full
                flex items-center justify-center
                transition-all duration-150
                peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1
                ${checked ? "border-primary bg-primary" : "border-neutral-border bg-white"}
                ${disabled ? "opacity-60" : ""}
              `}
            >
              {/* Inner dot - only show when checked */}
              {checked && (
                <div className="w-2.5 h-2.5 rounded-full bg-white transition-all duration-150" />
              )}
            </div>
          </div>

          {/* Label text */}
          {label && (
            <span className={`text-sm select-none ${checked ? "font-medium text-primary" : "text-text-primary"}`}>
              {label}
            </span>
          )}
        </label>

        {/* Error message */}
        {error && (
          <p className="mt-1 text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Radio.displayName = "Radio";

/**
 * RadioGroup helper para agrupar radios
 */
interface RadioGroupProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({
  label,
  error,
  required,
  children,
  className = "",
}: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block mb-3 text-sm font-medium text-text-primary">
          {label}
          {required && (
            <span className="ml-1 text-error" aria-label="requerido">
              *
            </span>
          )}
        </label>
      )}

      <div className="space-y-2" role="radiogroup">
        {children}
      </div>

      {error && (
        <p className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
