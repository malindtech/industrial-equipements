"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { ItemType } from "@/types/domain";

export default function NewProductPage() {
  const router = useRouter();
  const { vendors, addProduct } = useAppStore();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const stock = Number(fd.get("initialStock") ?? 0);
    const id = addProduct({
      sku: String(fd.get("sku")),
      name: String(fd.get("name")),
      type: fd.get("type") as ItemType,
      industry: String(fd.get("industry")),
      shortDescription: String(fd.get("shortDescription")),
      description: String(fd.get("description")),
      vendorId: String(fd.get("vendorId")),
      listPrice: Number(fd.get("listPrice")),
      currency: String(fd.get("currency")),
      leadTimeDays: Number(fd.get("leadTimeDays")),
      initialStock: stock > 0 ? stock : undefined,
      stockLocation: String(fd.get("stockLocation") ?? ""),
      unitCost: Number(fd.get("unitCost") ?? 0) || undefined,
    });
    router.push(`/products/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        backHref="/products"
        title="Add product"
        description="Adds to catalog, links to vendor, and optionally creates warehouse stock."
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" required />
          </div>
          <div>
            <Label htmlFor="vendorId">Primary vendor</Label>
            <Select id="vendorId" name="vendorId" required>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="name">Product name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select id="type" name="type" defaultValue="part">
              <option value="full_machine">Full machine</option>
              <option value="part">Part</option>
              <option value="accessory">Accessory</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" name="industry" required />
          </div>
        </div>
        <div>
          <Label htmlFor="shortDescription">Short description</Label>
          <Input id="shortDescription" name="shortDescription" required />
        </div>
        <div>
          <Label htmlFor="description">Full description</Label>
          <Textarea id="description" name="description" rows={3} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="listPrice">List price</Label>
            <Input id="listPrice" name="listPrice" type="number" min={0} required />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select id="currency" name="currency" defaultValue="USD">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="AED">AED</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="leadTimeDays">Lead time (days)</Label>
            <Input id="leadTimeDays" name="leadTimeDays" type="number" min={1} defaultValue={21} required />
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Optional stock on hand</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="initialStock">Quantity</Label>
              <Input id="initialStock" name="initialStock" type="number" min={0} defaultValue={0} />
            </div>
            <div>
              <Label htmlFor="unitCost">Unit cost</Label>
              <Input id="unitCost" name="unitCost" type="number" min={0} placeholder="Auto ~75% of list" />
            </div>
            <div>
              <Label htmlFor="stockLocation">Location</Label>
              <Input id="stockLocation" name="stockLocation" placeholder="Warehouse A" />
            </div>
          </div>
        </div>
        <Button type="submit">Save product</Button>
      </form>
    </div>
  );
}
