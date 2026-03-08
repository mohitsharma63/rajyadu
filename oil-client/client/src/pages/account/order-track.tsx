import { useMemo } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Truck, PackageCheck, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { oliUrl } from "@/lib/oliApi";

type OrderDto = {
  id: string;
  createdAt?: string;
  customerName?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  paymentStatus?: string;
  status?: string;
};

const FLOW = ["Pending", "Processing", "Shipped", "Delivered"] as const;

type FlowStatus = (typeof FLOW)[number];

function normalizeStatus(raw?: string): string {
  return String(raw || "Pending").trim();
}

function flowIndex(status: string): number {
  const s = status.toLowerCase();
  const idx = FLOW.findIndex((x) => x.toLowerCase() === s);
  return idx;
}

function formatDate(v?: string) {
  try {
    return new Date(v ?? Date.now()).toLocaleString();
  } catch {
    return v || "";
  }
}

export default function OrderTrack() {
  const [, params] = useRoute("/account/orders/:id/track");
  const orderId = params?.id || "";

  const { data, isLoading, error } = useQuery<OrderDto>({
    queryKey: [oliUrl(`/api/orders/${orderId}`)],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || json?.error || "Failed to load order");
      return json as OrderDto;
    },
    enabled: !!orderId,
  });

  const status = useMemo(() => normalizeStatus(data?.status), [data?.status]);
  const isCancelled = status.toLowerCase() === "cancelled";
  const idx = useMemo(() => flowIndex(status), [status]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Link href="/account/orders" className="inline-flex items-center text-red-600 hover:text-red-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Track Order</h1>
          <p className="mt-1 text-gray-600">Order #{orderId}</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-10 text-gray-600">Loading…</CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-10 text-red-600">{String((error as any)?.message || error)}</CardContent>
          </Card>
        ) : !data ? (
          <Card>
            <CardContent className="py-10 text-gray-600">Order not found.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-600">Current status</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant={isCancelled ? "destructive" : "outline"}>{status}</Badge>
                        <span className="text-sm text-gray-600">Payment: {String(data.paymentStatus || "unpaid")}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Placed: {formatDate(data.createdAt)}</div>
                  </div>

                  {isCancelled ? (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
                      <XCircle className="h-5 w-5 mt-0.5" />
                      <div>
                        <div className="font-medium">Order cancelled</div>
                        <div className="text-red-700/90">If you have any questions, please contact support.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {FLOW.map((s, i) => {
                          const completed = idx >= i;
                          const current = idx === i;
                          return (
                            <div
                              key={s}
                              className={
                                "rounded-lg border p-4 " +
                                (completed ? "border-green-200 bg-green-50" : "border-gray-200 bg-white")
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-gray-900">{s}</div>
                                {completed ? <PackageCheck className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-gray-400" />}
                              </div>
                              <div className="mt-2 text-xs text-gray-600">
                                {current ? "In progress" : completed ? "Completed" : "Pending"}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="rounded-md border bg-white p-4 text-sm text-gray-700">
                        <div className="font-medium">Tracking</div>
                        <div className="mt-1 text-gray-600">
                          Your order is being processed. Tracking updates will reflect admin status changes.
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="text-gray-600">{data.customerName || "-"}</div>
                  <Separator />
                  <div className="text-gray-600">
                    {[data.shippingCity, data.shippingState, data.shippingPincode].filter(Boolean).join(", ") || "-"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
