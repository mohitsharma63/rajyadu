import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { useCart } from "@/hooks/use-cart";

function getOrderIdFromUrl(): string | null {
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get("order_id");
  } catch {
    return null;
  }
}

type CashfreeOrder = {
  order_id?: string;
  order_status?: string;
  payment_session_id?: string;
};

export default function CashfreeReturn() {
  const { add: addOrder } = useOrders();
  const { clear } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<CashfreeOrder | null>(null);

  const orderId = useMemo(() => getOrderIdFromUrl(), []);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Missing order_id");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/payments/cashfree/orders/${encodeURIComponent(orderId)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.message || data?.error || "Failed to fetch payment status");
        return data;
      })
      .then(async (data) => {
        if (cancelled) return;
        setOrder(data);

        const status = String(data?.order_status || "").toUpperCase();
        if (status === "PAID") {
          try {
            const raw = window.localStorage.getItem("poppik:cashfree:pending:v1");
            if (raw) {
              const pending = JSON.parse(raw);

              try {
                await fetch("/api/orders", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    id: String(pending.cashfreeOrderId || orderId),
                    customerName: String(pending.name || "").trim(),
                    customerEmail: String(pending.userEmail || "").trim(),
                    customerPhone: String(pending.phone || "").trim(),
                    shippingAddress: [pending.address, pending.apartment].filter(Boolean).join(", "),
                    shippingCity: String(pending.city || "").trim(),
                    shippingState: String(pending.state || "").trim(),
                    shippingPincode: String(pending.pincode || "").trim(),
                    subtotal: pending.subtotal || 0,
                    shipping: pending.shipping || 0,
                    total: pending.total || 0,
                    paymentMethod: "online",
                    paymentStatus: "paid",
                    cashfreeOrderId: String(pending.cashfreeOrderId || orderId),
                    status: "Pending",
                    items: Array.isArray(pending.items)
                      ? pending.items.map((it: any) => ({
                          productId: it?.product?.id,
                          productName: it?.product?.name,
                          variant: it?.selectedVariant ?? null,
                          quantity: it?.quantity ?? 0,
                          unitPrice: typeof it?.product?.price === "number" ? it.product.price : it?.product?.price,
                        }))
                      : [],
                  }),
                });
              } catch {
              }

              addOrder({
                id: String(pending.cashfreeOrderId || orderId),
                createdAt: pending.createdAt || new Date().toISOString(),
                items: pending.items || [],
                subtotal: pending.subtotal || 0,
                shipping: pending.shipping || 0,
                total: pending.total || 0,
                userEmail: pending.userEmail,
                name: pending.name,
                status: "paid",
              });
              clear();
              window.localStorage.removeItem("poppik:cashfree:pending:v1");
            }
          } catch {
          }
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || "Failed to fetch payment status");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, addOrder, clear]);

  const status = String(order?.order_status || "").toUpperCase();
  const isPaid = status === "PAID";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking payment…</span>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && (
              <div className={isPaid ? "text-green-700" : "text-gray-700"}>
                <div className="flex items-center gap-2">
                  {isPaid ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  <span className="font-medium">{isPaid ? "Payment Successful" : `Payment Status: ${status || "UNKNOWN"}`}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <div>Order ID: {orderId}</div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link href="/account/orders">
                <Button className="btn-primary">View Orders</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
