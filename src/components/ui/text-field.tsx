"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: LucideIcon;
  /** Inline error message — shows error styling + message. */
  error?: string | null;
  /** Helper/guidance text shown when there's no error. */
  helper?: string;
  /** Show a success tick (e.g. after passing validation). */
  valid?: boolean;
};

/**
 * Floating-label text field with inline validation, helper guidance and an
 * automatic password show/hide toggle. Built on the design-system tokens.
 */
export function TextField({
  label,
  value,
  onChange,
  icon: Icon,
  error,
  helper,
  valid,
  type = "text",
  className,
  id,
  ...rest
}: Props) {
  const autoId = useId();
  const fieldId = id || autoId;
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (reveal ? "text" : "password") : type;
  const floated = focused || value.length > 0;
  const describedBy = error ? `${fieldId}-error` : helper ? `${fieldId}-helper` : undefined;

  const borderColor = error
    ? "border-error focus-within:border-error"
    : focused
      ? "border-primary"
      : "border-border hover:border-foreground/20";

  return (
    <div className={className}>
      <div
        className={`relative rounded-input border bg-surface transition-colors ${borderColor} ${
          focused ? "ring-2 ring-ring/15" : ""
        }`}
      >
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
              error ? "text-error" : focused ? "text-primary" : "text-muted-foreground"
            }`}
          />
        )}

        <label
          htmlFor={fieldId}
          className={`pointer-events-none absolute left-0 origin-left text-muted-foreground transition-all duration-150 ${
            Icon ? "ml-11" : "ml-4"
          } ${floated ? "top-1.5 text-caption font-bold uppercase tracking-wide" : "top-1/2 -translate-y-1/2 text-body"} ${
            focused && !error ? "text-primary" : error ? "text-error" : ""
          }`}
        >
          {label}
        </label>

        <input
          id={fieldId}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`h-14 w-full bg-transparent pb-1.5 pt-5 text-body text-foreground outline-none ${
            Icon ? "pl-11" : "pl-4"
          } ${isPassword || valid ? "pr-11" : "pr-4"}`}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {!isPassword && valid && !error && (
          <CheckCircle2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-success" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={`${fieldId}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 px-1 text-caption font-bold normal-case tracking-normal text-error"
          >
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </motion.p>
        ) : helper ? (
          <p key="helper" id={`${fieldId}-helper`} className="mt-1.5 px-1 text-caption font-medium normal-case tracking-normal text-muted-foreground">
            {helper}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
