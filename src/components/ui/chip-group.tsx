import { cn } from "@/lib/utils";

/** Multi-select rendered as tappable chips. Plain checkboxes underneath, so it works without JS. */
export function ChipGroup({
  name,
  legend,
  options,
  defaultSelected = [],
  error,
}: {
  name: string;
  legend: string;
  options: Record<string, string>;
  defaultSelected?: string[];
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {Object.entries(options).map(([value, label]) => (
          <label
            key={value}
            className={cn(
              "cursor-pointer select-none rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-muted transition",
              "has-[:checked]:border-rose has-[:checked]:bg-rose-soft has-[:checked]:text-rose has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rose",
            )}
          >
            <input type="checkbox" name={name} value={value} defaultChecked={defaultSelected.includes(value)} className="sr-only" />
            {label}
          </label>
        ))}
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </fieldset>
  );
}
