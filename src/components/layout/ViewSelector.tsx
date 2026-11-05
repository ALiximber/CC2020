interface Props<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export function ViewSelector<T extends string>({ label, options, value, onChange }: Props<T>) {
  return <div role="group" aria-label={label} className="view-selector print:hidden">
    {options.map(option => <button key={option} aria-pressed={value === option} onClick={() => onChange(option)}>{option}</button>)}
  </div>;
}
