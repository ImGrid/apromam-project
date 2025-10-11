import { forwardRef, type InputHTMLAttributes } from "react";

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className = "", disabled, ...props }, ref) => {
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
              className="sr-only peer"
              {...props}
            />

            {/* Custom radio visual */}
            <div
              className={`
                w-5 h-5 border-2 rounded-full
                flex items-center justify-center
                transition-all duration-150
                peer-checked:border-primary
                peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1
                border-neutral-border
                ${disabled ? "bg-neutral-bg" : "bg-white"}
              `}
            >
              {/* Inner dot */}
              <div
                className="
                  w-2.5 h-2.5 rounded-full bg-primary
                  opacity-0 peer-checked:opacity-100
                  transition-opacity duration-150
                  scale-0 peer-checked:scale-100
                "
              />
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
