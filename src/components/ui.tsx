import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary:
    "border-line bg-surface text-ink-muted hover:text-ink border hover:bg-surface-muted",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-muted",
  danger: "border-line bg-surface border text-danger hover:bg-danger-soft",
};

const BUTTON_BASE =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-body-md font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

// Shared button styling used for both <button> and <Link> actions.
export function buttonClass(variant: ButtonVariant = "secondary") {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]}`;
}

// Standard action button.
export function Button({
  variant = "secondary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return <button {...props} className={`${buttonClass(variant)} ${className}`} />;
}

// Button-styled link for navigation actions.
export function LinkButton({
  href,
  variant = "secondary",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${buttonClass(variant)} ${className}`}>
      {children}
    </Link>
  );
}

// Card surface used for every panel in the app.
export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`border-line bg-surface rounded-[12px] border ${className}`}>
      {children}
    </div>
  );
}

// Page heading row with an optional action on the right.
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-ink text-headline-sm">
          {title}
        </h2>
        {description && (
          <p className="text-ink-muted text-body-md mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// Centred empty state for tables and lists with no rows yet.
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-14 text-center">
      <span className="bg-surface-muted border-line text-ink-subtle flex h-10 w-10 items-center justify-center rounded-full border">
        {icon}
      </span>
      <p className="text-ink text-[13px] font-medium">{title}</p>
      <p className="text-ink-muted max-w-[300px] text-[12px] leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

const FIELD_BASE =
  "border-line bg-surface-muted text-ink placeholder:text-ink-subtle focus:border-accent focus:bg-surface w-full rounded-lg border px-3 py-2 text-body-md transition-colors focus:ring-2 focus:ring-[var(--accent)]/15 focus:outline-none";

// Labelled text input for forms.
export function Field({
  label,
  name,
  hint,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  hint?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="text-ink mb-1.5 block text-[12.5px] font-medium"
      >
        {label}
      </label>
      <input id={name} name={name} {...props} className={FIELD_BASE} />
      {hint && <p className="text-ink-subtle mt-1 text-[11.5px]">{hint}</p>}
    </div>
  );
}

// Labelled select for enum-backed fields.
export function SelectField({
  label,
  name,
  options,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="text-ink mb-1.5 block text-[12.5px] font-medium"
      >
        {label}
      </label>
      <select id={name} name={name} {...props} className={FIELD_BASE}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Labelled multi-line input for notes and descriptions.
export function TextareaField({
  label,
  name,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="text-ink mb-1.5 block text-[12.5px] font-medium"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        {...props}
        className={`${FIELD_BASE} resize-y`}
      />
    </div>
  );
}
