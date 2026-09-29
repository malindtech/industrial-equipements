"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export default function NewVendorPage() {
  const router = useRouter();
  const addVendor = useAppStore((s) => s.addVendor);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const specialties = String(fd.get("specialties") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const id = addVendor({
      name: String(fd.get("name")),
      country: String(fd.get("country")),
      city: String(fd.get("city")),
      contactEmail: String(fd.get("contactEmail")),
      contactPhone: String(fd.get("contactPhone")),
      leadTimeDays: Number(fd.get("leadTimeDays")),
      specialties,
      notes: String(fd.get("notes") ?? ""),
      rating: Number(fd.get("rating")),
    });
    router.push(`/vendors/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        backHref="/vendors"
        title="Add vendor"
        description="International suppliers — linked to products and import tracking."
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <Label htmlFor="name">Vendor name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" required />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactEmail">Email</Label>
            <Input id="contactEmail" name="contactEmail" type="email" required />
          </div>
          <div>
            <Label htmlFor="contactPhone">Phone</Label>
            <Input id="contactPhone" name="contactPhone" required />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="leadTimeDays">Lead time (days)</Label>
            <Input id="leadTimeDays" name="leadTimeDays" type="number" min={1} defaultValue={30} required />
          </div>
          <div>
            <Label htmlFor="rating">Rating (1–5)</Label>
            <Input id="rating" name="rating" type="number" min={1} max={5} step={0.1} defaultValue={4.5} required />
          </div>
        </div>
        <div>
          <Label htmlFor="specialties">Specialties (comma-separated)</Label>
          <Input id="specialties" name="specialties" placeholder="Hydraulics, Tractors" />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>
        <Button type="submit">Save vendor</Button>
      </form>
    </div>
  );
}
