import { Link, useLocation } from "wouter";
import { useMemo, useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
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
  subtotal?: number;
  shipping?: number;
  total?: number;
  status?: string;
  items?: OrderItemDto[];
};

const ORDER_STATUSES = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function getStatusBadgeVariant(status?: string) {
  switch (String(status || "").toLowerCase()) {
    case "delivered":
      return "default";
    case "shipped":
      return "secondary";
    case "processing":
      return "outline";
    case "cancelled":
      return "destructive";
    case "pending":
    default:
      return "outline";
  }
}

export default function OrdersHistory() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [trackId, setTrackId] = useState("");

  const email = (user?.email as string | undefined) ?? undefined;

  const { data: orders = [], isLoading, error, refetch } = useQuery<OrderDto[]>({
    queryKey: [oliUrl("/api/orders"), email],
    queryFn: async () => {
      if (!email) return [];
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || json?.error || "Failed to fetch orders");
      return json as OrderDto[];
    },
    enabled: !!email,
  });

  const filtered = useMemo(() => {
    let next = [...orders];
    if (statusFilter !== "All") {
      next = next.filter((o) => String(o.status || "Pending") === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      next = next.filter((o) => {
        if (o.id.toLowerCase().includes(q)) return true;
        if (String(o.status || "").toLowerCase().includes(q)) return true;
        return (o.items || []).some((it) => String(it.productName || "").toLowerCase().includes(q));
      });
    }
    return next;
  }, [orders, search, statusFilter]);

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
        </div>

        {!email ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-900">Login required</h2>
              <p className="mt-2 text-gray-600">Please login to view your orders.</p>
              <div className="mt-6">
                <Link href="/auth/login">
                  <Button className="btn-primary">Login</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-600">Loading…</CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-red-600">{String((error as any)?.message || error)}</p>
              <div className="mt-4">
                <Button className="btn-primary" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
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
            <Card>
              <CardHeader>
                <CardTitle>Track Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2 space-y-1">
                    <div className="text-sm text-gray-600">Enter your Order ID</div>
                    <Input
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      placeholder="e.g. ORD-ABCD1234"
                    />
                  </div>
                  <Button
                    className="btn-primary"
                    onClick={() => {
                      const id = trackId.trim();
                      if (!id) return;
                      setLocation(`/account/orders/${encodeURIComponent(id)}/track`);
                    }}
                  >
                    Track Order
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by order id, product, status…"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex md:justify-end">
                    <Button variant="outline" onClick={() => refetch()}>
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No orders found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((o) => (
                          <TableRow key={o.id}>
                            <TableCell className="font-medium">{o.id}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(o.status)}>{o.status || "Pending"}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(o.createdAt ?? Date.now()).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-semibold">₹{(o.total ?? 0).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/account/orders/${encodeURIComponent(o.id)}`}>
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                </Link>
                                <Link href={`/account/orders/${encodeURIComponent(o.id)}/track`}>
                                  <Button className="btn-primary" size="sm">
                                    Track
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const url = `/account/orders/${encodeURIComponent(o.id)}/invoice?download=1`;
                                    window.open(url, "_blank", "noopener,noreferrer");
                                  }}
                                >
                                  Invoice
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
