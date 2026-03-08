import { Link } from "wouter";
import { ArrowLeft, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";

export default function OrdersHistory() {
  const { user } = useAuth();
  const { byEmail, clear } = useOrders();

  const email = (user?.email as string | undefined) ?? undefined;
  const orders = byEmail(email);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">Orders</h1>
            <p className="mt-2 text-gray-600">Your recent orders</p>
          </div>

          <Button variant="outline" onClick={clear} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-900">No orders yet</h2>
              <p className="mt-2 text-gray-600">Place your first order to see it here.</p>
              <div className="mt-6">
                <Link href="/">
                  <Button className="btn-primary">Continue Shopping</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o.id}>
                <CardHeader className="space-y-1">
                  <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                    <span>Order #{o.id}</span>
                    <span className="text-sm font-normal text-gray-600">
                      {new Date(o.createdAt).toLocaleString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">Subtotal</p>
                      <p className="font-medium">₹{o.subtotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Shipping</p>
                      <p className="font-medium">₹{o.shipping.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-semibold">₹{o.total.toLocaleString()}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {o.items.map((it) => (
                      <div
                        key={`${it.product.id}:${it.selectedVariant ?? ""}`}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{it.product.name}</p>
                          {it.selectedVariant ? (
                            <p className="text-xs text-gray-500">Variant: {it.selectedVariant}</p>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-gray-700">x{it.quantity}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
