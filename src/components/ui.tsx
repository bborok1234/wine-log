import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

function getWineTypeMeta(type: string | null | undefined) {
  const normalized = (type ?? "").trim().toLowerCase();
  const typeLabels: Record<string, string> = {
    red: "Red",
    white: "White",
    sparkling: "Sparkling",
    rose: "Rosé",
    dessert: "Dessert",
    fortified: "Fortified",
    other: "Other",
  };

  const label = typeLabels[normalized] ?? (type ? String(type) : "Other");

  let colorClass = "bg-stone-100 text-stone-600";
  if (normalized === "red")
    colorClass = "bg-wine-50 text-wine-800 border border-wine-100";
  if (normalized === "white")
    colorClass = "bg-yellow-50 text-yellow-700 border border-yellow-100";
  if (normalized === "sparkling")
    colorClass = "bg-emerald-50 text-emerald-700 border border-emerald-100";
  if (normalized === "rose")
    colorClass = "bg-pink-50 text-pink-700 border border-pink-100";

  return { label, colorClass, normalized };
}

export interface WineTypeBadgeProps {
  type?: string | null;
}

export function WineTypeBadge({ type }: WineTypeBadgeProps) {
  const meta = getWineTypeMeta(type);
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm ${meta.colorClass}`}
    >
      {meta.label}
    </span>
  );
}

export interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

export function StarRating({
  rating,
  onChange,
  size = "md",
  readOnly = false,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses: Record<NonNullable<StarRatingProps["size"]>, string> = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex gap-1.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => (onChange ? onChange(star) : null)}
          className={[
            readOnly
              ? "cursor-default"
              : "cursor-pointer hover:scale-110 active:scale-95",
            "transition-all duration-200",
          ].join(" ")}
          aria-label={`${star}점`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={star <= rating ? 0 : 1.5}
            className={[
              sizeClasses[size],
              star <= rating
                ? "text-amber-400 drop-shadow-sm"
                : "text-stone-300",
            ].join(" ")}
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  fullWidth,
  loading,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-bold transition-all duration-200 transform active:scale-[0.97] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-gradient-to-br from-wine-700 to-wine-900 text-white shadow-lg shadow-wine-200 hover:shadow-wine-300 hover:brightness-105",
    secondary:
      "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-sm",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    ghost:
      "bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${base} ${variants[variant]} ${width} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="mb-5 group">
      {label ? (
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-wine-600 transition-colors">
          {label}
        </label>
      ) : null}
      <input
        className={`w-full px-5 py-3.5 bg-stone-50 border border-transparent rounded-2xl text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-wine-200 focus:ring-4 focus:ring-wine-50 transition-all duration-300 shadow-inner ${className}`}
        {...props}
      />
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className = "", ...props }: TextAreaProps) {
  return (
    <div className="mb-5 group">
      {label ? (
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-wine-600 transition-colors">
          {label}
        </label>
      ) : null}
      <textarea
        className={`w-full px-5 py-3.5 bg-stone-50 border border-transparent rounded-2xl text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-wine-200 focus:ring-4 focus:ring-wine-50 transition-all duration-300 shadow-inner min-h-[120px] resize-none ${className}`}
        {...props}
      />
    </div>
  );
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export function Select({
  label,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="mb-5 group">
      {label ? (
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-wine-600 transition-colors">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          className={`w-full appearance-none px-5 py-3.5 bg-stone-50 border border-transparent rounded-2xl text-stone-800 text-[16px] sm:text-sm focus:bg-white focus:outline-none focus:border-wine-200 focus:ring-4 focus:ring-wine-50 transition-all duration-300 shadow-inner ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={[
        "bg-white/90 backdrop-blur-sm rounded-[24px] p-5 transition-all duration-300 shadow-[0_8px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)]",
        onClick ? "cursor-pointer active:scale-[0.98] active:bg-white" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
