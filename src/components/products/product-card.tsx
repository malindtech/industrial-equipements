import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/domain";
import { stockForProduct } from "@/lib/selectors";
import type { AppData } from "@/types/domain";
import { ArrowUpRight } from "lucide-react";

export function ProductCard({
  product,
  inventory,
  vendorName,
}: {
  product: Product;
  inventory: AppData["inventory"];
  vendorName: string;
}) {
  const qty = stockForProduct(inventory, product.id);
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className={`h-28 bg-gradient-to-br ${product.accent} p-5 text-white`}>
        <p className="font-mono text-xs opacity-80">{product.sku}</p>
        <p className="mt-2 text-lg font-semibold leading-snug">{product.name}</p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-2 text-sm text-slate-600">{product.shortDescription}</p>
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {formatCurrency(product.listPrice, product.currency)}
            </p>
            <p className="text-xs text-slate-500">
              {vendorName} · {product.leadTimeDays}d lead · {qty} in stock
            </p>
          </div>
          <span className="rounded-full bg-slate-100 p-2 text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-600">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
