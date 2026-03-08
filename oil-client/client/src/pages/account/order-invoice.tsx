import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

function money(v: any) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? 0).replace(/[^0-9.]/g, ""));
  const val = Number.isFinite(n) ? n : 0;
  return val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dt(v?: string) {
  try {
    return new Date(v ?? Date.now()).toLocaleString();
  } catch {
    return v || "";
  }
}

export default function OrderInvoice() {
  const [, params] = useRoute("/account/orders/:id/invoice");
  const orderId = params?.id || "";

  const { data, isLoading, error } = useQuery<OrderDto>({
    queryKey: [oliUrl(`/api/orders/${orderId}`)],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || json?.error || "Failed to load invoice");
      return json as OrderDto;
    },
    enabled: !!orderId,
  });

  const invoiceNo = useMemo(() => orderId, [orderId]);

  useEffect(() => {
    if (!data) return;
    try {
      const u = new URL(window.location.href);
      const auto = u.searchParams.get("download") === "1";
      if (!auto) return;
      const t = window.setTimeout(() => window.print(), 250);
      return () => window.clearTimeout(t);
    } catch {
      return;
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>

      <div className="mx-auto max-w-4xl space-y-4">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold text-gray-900">Invoice</div>
            <div className="text-sm text-gray-600">Order #{orderId}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.close()}>
              Close
            </Button>
            <Button className="btn-primary" onClick={() => window.print()}>
              Download PDF
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card className="print-area">
            <CardContent className="py-10 text-gray-600">Loading…</CardContent>
          </Card>
        ) : error ? (
          <Card className="print-area">
            <CardContent className="py-10 text-red-600">{String((error as any)?.message || error)}</CardContent>
          </Card>
        ) : !data ? (
          <Card className="print-area">
            <CardContent className="py-10 text-gray-600">Invoice not found.</CardContent>
          </Card>
        ) : (
          <Card className="print-area bg-white">
            <CardContent className="p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <div className="text-xl font-bold text-gray-900">RAJYADU Organic Food</div>
                  <div className="text-sm text-gray-600">Invoice</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium text-gray-900">Invoice No: {invoiceNo}</div>
                  <div className="text-gray-600">Invoice Date: {dt(data.createdAt)}</div>
                  <div className="text-gray-600">Payment: {String(data.paymentStatus || "unpaid")}</div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Bill To</div>
                  <div className="mt-2 font-medium text-gray-900">{data.customerName || "-"}</div>
                  <div className="text-gray-600">{data.customerEmail || ""}</div>
                  <div className="text-gray-600">{data.customerPhone || ""}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Ship To</div>
                  <div className="mt-2 font-medium text-gray-900">{data.shippingAddress || "-"}</div>
                  <div className="text-gray-600">
                    {[data.shippingCity, data.shippingState, data.shippingPincode].filter(Boolean).join(", ")}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-700">Item</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-700">Qty</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-700">Unit Price</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.items || []).map((it, idx) => {
                      const qty = it.quantity ?? 0;
                      const unit = typeof it.unitPrice === "number" ? it.unitPrice : parseFloat(String(it.unitPrice ?? 0));
                      const amt = (Number.isFinite(unit) ? unit : 0) * qty;
                      return (
                        <tr key={`${it.productId ?? idx}`} className="border-t">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{it.productName || "Item"}</div>
                            {it.variant ? <div className="text-xs text-gray-500">Variant: {it.variant}</div> : null}
                          </td>
                          <td className="px-4 py-3 text-right">{qty}</td>
                          <td className="px-4 py-3 text-right">₹{money(unit)}</td>
                          <td className="px-4 py-3 text-right font-medium">₹{money(amt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{money(data.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₹{money(data.shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">₹{money(data.total)}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="text-xs text-gray-500">
                This is a computer generated invoice.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
