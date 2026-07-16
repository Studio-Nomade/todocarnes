import { FieldIcon, type FieldIconName } from "./FieldIcon";

type ProductFieldRowProps = {
  icon: FieldIconName;
  label: string;
  value?: string | null;
};

export function ProductFieldRow({ icon, label, value }: ProductFieldRowProps) {
  const values = value?.trim() ? value.split("\n") : ["—"];

  return (
    <div className="grid h-[66px] grid-cols-[73px_1fr] border-b border-ink/20 last:border-b-0">
      <div className="flex items-center justify-start border-r border-ink/20">
        <FieldIcon name={icon} />
      </div>
      <div className="flex flex-col justify-center pl-6">
        <span className="text-[13px] font-normal uppercase leading-none text-blue">{label}</span>
        <ul className="mt-1 list-none text-[18px] font-normal leading-[19px] text-ink">
          {values.map((item, index) => (
            <li key={`${item}-${index}`}>{item || "—"}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
