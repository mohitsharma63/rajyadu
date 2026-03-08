import { useEffect, useMemo } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { oliUrl } from "@/lib/oliApi";

type OrderItemDto = {
  productId?: number;
  productName?: string;
  variant?: string | null;
  quantity?: number;
  unitPrice?: number | string;
};

type OrderDto = {
  id: string;
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  subtotal?: number;
  shipping?: number;
  total?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  items?: OrderItemDto[];
};

function formatMoney(v: any) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? 0).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n.toLocaleString() : "0";
}

export default function OrderDetail() {
  const [, params] = useRoute("/account/orders/:id");
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

  const status = useMemo(() => String(data?.status || "Pending"), [data?.status]);

  useEffect(() => {
    if (!data) return;
    try {
      const u = new URL(window.location.href);
      const shouldPrint = u.searchParams.get("print") === "1";
      if (!shouldPrint) return;
      const t = window.setTimeout(() => window.print(), 250);
      return () => window.clearTimeout(t);
    } catch {
      return;
    }
  }, [data]);

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
                    <Package className="h-5 w-5" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-600">Current status</div>
                  <div className="text-lg font-semibold">{status}</div>
                  <div className="text-sm text-gray-600">Payment: {String(data.paymentStatus || "unpaid")}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Invoice / Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Customer</div>
                      <div className="font-medium">{data.customerName || "-"}</div>
                      <div className="text-sm text-gray-600">{data.customerEmail || ""}</div>
                      <div className="text-sm text-gray-600">{data.customerPhone || ""}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Shipping address</div>
                      <div className="font-medium">{data.shippingAddress || "-"}</div>
                      <div className="text-sm text-gray-600">
                        {[data.shippingCity, data.shippingState, data.shippingPincode].filter(Boolean).join(", ")}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {(data.items || []).map((it, idx) => (
                      <div key={`${it.productId ?? idx}`} className="flex items-start justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{it.productName || "Item"}</div>
                          {it.variant ? <div className="text-xs text-gray-500">Variant: {it.variant}</div> : null}
                        </div>
                        <div className="shrink-0 text-gray-700">x{it.quantity ?? 0}</div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Subtotal</div>
                      <div className="font-medium">₹{formatMoney(data.subtotal)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Shipping</div>
                      <div className="font-medium">₹{formatMoney(data.shipping)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="font-semibold">₹{formatMoney(data.total)}</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => window.print()}>
                        Print Invoice
                      </Button>
                      <Button
                        className="btn-primary"
                        onClick={() => {
                          const url = `/account/orders/${encodeURIComponent(orderId)}/invoice?download=1`;
                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                      >
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Order</span><span>{data.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Payment</span><span>{String(data.paymentMethod || "-")}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Status</span><span>{status}</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
