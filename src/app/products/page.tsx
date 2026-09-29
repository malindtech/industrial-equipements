"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { Input, Select } from "@/components/ui/input";

export default function ProductsPage() {
  const { products, vendors, inventory } = useAppStore();
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("all");

  const industries = useMemo(
    () => [...new Set(products.map((p) => p.industry))].sort(),
    [products]
  );

  const filtered = products.filter((p) => {
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.sku.toLowerCase().includes(q.toLowerCase());
    const matchInd = industry === "all" || p.industry === industry;
    return matchQ && matchInd;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Product catalog"
        description="Machines and parts you source globally — linked to vendors, stock, and customer orders."
        action={
          <Link href="/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add product
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name or SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="sm:max-w-xs"
          aria-label="Filter by industry"
        >
          <option value="all">All industries</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => {
          const vendor = vendors.find((v) => v.id === product.vendorId);
          return (
            <ProductCard
              key={product.id}
              product={product}
              inventory={inventory}
              vendorName={vendor?.name ?? "—"}
            />
          );
        })}
      </div>
    </div>
  );
}
