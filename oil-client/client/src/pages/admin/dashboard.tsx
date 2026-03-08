import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { oliGetJson, oliUrl } from "@/lib/oliApi";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

interface DashboardStats {
  revenue: number;
  pendingOrders: number;
  activeProducts: number;
  newCustomers: number;
  totalProducts: number;
  totalCustomers: number;
}

interface SalesChartData {
  data: Array<{
    date: string;
    sales: number;
  }>;
}

interface RecentOrder {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  customerName?: string;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: [oliUrl("/api/admin/dashboard/stats")],
    queryFn: async () => {
      return await oliGetJson<DashboardStats>("/api/admin/dashboard/stats");
    },
  });

  const { data: chartData, isLoading: chartLoading } = useQuery<SalesChartData>({
    queryKey: [oliUrl("/api/admin/dashboard/sales-chart")],
    queryFn: async () => {
      return await oliGetJson<SalesChartData>("/api/admin/dashboard/sales-chart");
    },
  });

  const { data: recentOrdersData } = useQuery<{ orders: RecentOrder[] }>({
    queryKey: [oliUrl("/api/admin/dashboard/recent-orders")],
    queryFn: async () => {
      return await oliGetJson<{ orders: RecentOrder[] }>("/api/admin/dashboard/recent-orders");
    },
  });

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
  };

  const chartDataFormatted = chartData?.data.map((item) => ({
    date: formatDate(item.date),
    sales: item.sales,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your store performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {statsLoading ? "Loading..." : formatCurrency(stats?.revenue || 0)}
            </div>
            <div className="text-xs text-muted-foreground">Last 30 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {statsLoading ? "Loading..." : stats?.pendingOrders || 0}
            </div>
            <div className="text-xs text-muted-foreground">Pending fulfillment</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {statsLoading ? "Loading..." : stats?.activeProducts || 0}
            </div>
            <div className="text-xs text-muted-foreground">Active listings</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {statsLoading ? "Loading..." : stats?.newCustomers || 0}
            </div>
            <div className="text-xs text-muted-foreground">New this month</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Loading chart...
              </div>
            ) : chartDataFormatted.length > 0 ? (
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartDataFormatted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrdersData?.orders && recentOrdersData.orders.length > 0 ? (
              <div className="space-y-3">
                {recentOrdersData.orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between text-sm border-b pb-2"
                  >
                    <div>
                      <div className="font-medium">Order #{order.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(order.total)}</div>
                      <div className="text-xs text-muted-foreground">{order.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No orders yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {stats && stats.activeProducts > 0
                ? `All ${stats.activeProducts} products are in stock.`
                : "No alerts."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
