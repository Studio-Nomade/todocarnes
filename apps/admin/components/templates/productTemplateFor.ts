import type { CategoryName } from "@/lib/pdf/page-order";
import { DonPanchoProductPage } from "./DonPanchoProductPage";
import { ProductPageTemplate } from "./ProductPageTemplate";

export function productTemplateFor(category: CategoryName) {
  return category === "Don Pancho" ? DonPanchoProductPage : ProductPageTemplate;
}
