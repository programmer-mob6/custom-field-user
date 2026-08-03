type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  label: string;
};
// Generic React component: the selected value stays tied to its option union.
export function SelectFilter<T extends string>({ value, options, onChange, label }: Props<T>) {
  return (
    <label className="filter-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
