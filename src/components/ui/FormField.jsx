export const inputClasses =
  "w-full rounded-xl border border-border bg-surface-strong px-5 py-4 text-sm text-ink placeholder:text-ink/30 outline-none transition-colors focus:border-ink/40";

export function Field({ label, htmlFor, error, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[15px] font-semibold tracking-tight text-ink">
        {label}
        {required ? <span aria-hidden> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
