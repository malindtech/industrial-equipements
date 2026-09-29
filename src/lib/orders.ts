import type { Order } from "@/types/domain";

export function orderTotal(order: Order) {
  return order.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
}
