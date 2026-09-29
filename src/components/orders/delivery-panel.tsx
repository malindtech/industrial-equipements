"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { Order } from "@/types/domain";
import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useState } from "react";

export function DeliveryPanel({ order }: { order: Order }) {
  const { scheduleDelivery, markDelivered } = useAppStore();
  const [date, setDate] = useState(
    order.deliveryScheduledAt?.slice(0, 10) ?? order.expectedDelivery ?? ""
  );

  const canMarkDelivered = order.status === "ready_to_deliver" || order.status === "confirmed";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Delivery</h2>
      <p className="mt-1 text-xs text-slate-500">
        Schedule handover to customer · mark delivered to unlock payment confirmation.
      </p>

      {order.deliveredAt ? (
        <p className="mt-4 text-sm font-medium text-emerald-700">
          Delivered {formatDate(order.deliveredAt)}
        </p>
      ) : (
        <>
          <div className="mt-4">
            <Label htmlFor="delivery-date">Scheduled date</Label>
            <Input
              id="delivery-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            variant="secondary"
            className="mt-3 w-full"
            disabled={!date}
            onClick={() => scheduleDelivery(order.id, new Date(date).toISOString())}
          >
            Save delivery schedule
          </Button>
          {order.deliveryScheduledAt ? (
            <p className="mt-2 text-xs text-slate-500">
              Scheduled {formatDate(order.deliveryScheduledAt)}
            </p>
          ) : null}
          <Button
            className="mt-3 w-full"
            disabled={!canMarkDelivered}
            onClick={() => {
              markDelivered(order.id);
            }}
          >
            Mark delivered to customer
          </Button>
        </>
      )}
    </div>
  );
}
