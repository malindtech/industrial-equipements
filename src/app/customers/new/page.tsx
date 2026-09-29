"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function NewCustomerPage() {
  const router = useRouter();
  const addCustomer = useAppStore((s) => s.addCustomer);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = addCustomer({
      name: String(fd.get("name")),
      company: String(fd.get("company")),
      email: String(fd.get("email")),
      phone: String(fd.get("phone")),
      country: String(fd.get("country")),
      industry: String(fd.get("industry")),
    });
    router.push(`/customers/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        backHref="/customers"
        title="Add customer"
        description="For repeat buyers or walk-ins. Leads can also auto-create a customer when a quote is accepted."
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" required />
        </div>
        <div>
          <Label htmlFor="name">Contact name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" required />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" required />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" name="industry" placeholder="Agriculture, Construction…" required />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Tip: use <strong>Leads → Quote → Order</strong> when the buyer starts as an inquiry — a customer
          record is created automatically on acceptance.
        </p>
        <div className="flex gap-2 pt-2">
          <Button type="submit">Save customer</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/customers")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
