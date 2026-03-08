import { useCallback, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";

const ORDERS_STORAGE_KEY = "poppik:orders:v1";
const ORDERS_EVENT_NAME = "orders:update";

export type OrderItem = CartItem;

export type Order = {
  id: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  userEmail?: string;
  name?: string;
  status?: string;
};

function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Order[];
  } catch {
    return [];
  }
}

function writeOrders(items: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(ORDERS_EVENT_NAME));
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => readOrders());

  useEffect(() => {
    const sync = () => setOrders(readOrders());
    window.addEventListener(ORDERS_EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ORDERS_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback(
    (order: Order) => {
      const next = [order, ...orders];
      setOrders(next);
      writeOrders(next);
    },
    [orders]
  );

  const clear = useCallback(() => {
    setOrders([]);
    writeOrders([]);
  }, []);

  const byEmail = useCallback(
    (email?: string) => {
      const e = (email ?? "").trim().toLowerCase();
      if (!e) return orders;
      return orders.filter((o) => (o.userEmail ?? "").trim().toLowerCase() === e);
    },
    [orders]
  );

  const count = useMemo(() => orders.length, [orders]);

  return {
    orders,
    count,
    byEmail,
    add,
    clear,
  };
}
