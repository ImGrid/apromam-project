import { forwardRef, type InputHTMLAttributes } from "react";
import { Check, Minus } from "lucide-react";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, error, indeterminate = false, className = "", disabled, ...props },
    ref
  ) => {
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
            {/* Hidden native checkbox */}
            <input
              ref={ref}
              type="checkbox"
              disabled={disabled}
              className="sr-only peer"
              {...props}
            />

            {/* Custom checkbox visual */}
            <div
              className={`
                w-5 h-5 border-2 rounded
                flex items-center justify-center
                transition-all duration-150
                peer-checked:bg-primary peer-checked:border-primary
                peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1
                ${
                  indeterminate
                    ? "bg-primary border-primary"
                    : "border-neutral-border peer-checked:border-primary"
                }
                ${disabled ? "bg-neutral-bg" : "bg-white"}
              `}
            >
              {/* Check icon */}
              {indeterminate ? (
                <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              ) : (
                <Check
                  className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                  strokeWidth={3}
                />
              )}
            </div>
          </div>

          {/* Label text */}
          {label && (
            <span className="text-sm select-none text-text-primary">
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

Checkbox.displayName = "Checkbox";
