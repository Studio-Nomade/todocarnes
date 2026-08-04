import Image from "next/image";

type CategoryIconProps = {
  category: "Cerdo" | "Pollo" | "Vacuno" | "Trimming";
  tone?: "dark" | "light";
};

const categoryIcons = {
  Cerdo: "/categories/cerdo.png",
  Pollo: "/categories/pollo.png",
  Trimming: "/categories/trimming.png",
  Vacuno: "/categories/vacuno.png",
} as const;

export function CategoryIcon({ category, tone = "light" }: CategoryIconProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={`h-14 w-14 object-contain ${tone === "dark" ? "brightness-0" : ""}`}
      height={211}
      priority
      src={categoryIcons[category]}
      width={211}
    />
  );
}
