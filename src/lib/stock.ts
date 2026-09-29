import type { InventoryItem, QuoteLine } from "@/types/domain";
import { stockForProduct } from "@/lib/selectors";

export function validateStockForQuoteLines(
  lines: Pick<QuoteLine, "productId" | "quantity" | "fulfillment">[],
  inventory: InventoryItem[]
): { ok: true } | { ok: false; message: string } {
  for (const line of lines) {
    if (line.fulfillment !== "stock") continue;
    const available = stockForProduct(inventory, line.productId);
    if (available < line.quantity) {
      return {
        ok: false,
        message: `Insufficient stock for product (${available} available, ${line.quantity} requested). Switch to vendor import or reduce quantity.`,
      };
    }
  }
  return { ok: true };
}
