import Image from "next/image";
import type { CategoryName } from "@/lib/pdf/page-order";

type CategoryIconProps = {
  category: CategoryName;
  tone?: "dark" | "light";
};

const categoryIcons = {
  Cerdo: "/categories/cerdo.png",
  "Don Pancho": "/categories/don-pancho.png",
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
