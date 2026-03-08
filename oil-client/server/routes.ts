import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/ithink/serviceability", async (req, res) => {
    try {
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085";
      const qp = new URLSearchParams();
      for (const [k, v] of Object.entries(req.query)) {
        if (v == null) continue;
        if (Array.isArray(v)) {
          v.forEach((x) => {
            if (x != null) qp.append(k, String(x));
          });
        } else {
          qp.set(k, String(v));
        }
      }

      const response = await fetch(`${backendUrl}/api/ithink/serviceability?${qp.toString()}`);
      const text = await response.text();
      res.status(response.status);
      res.setHeader("content-type", response.headers.get("content-type") || "application/json");
      res.send(text);
    } catch (error) {
      console.error("Error fetching serviceability:", error);
      res.status(500).json({ error: "Failed to fetch serviceability" });
    }
  });

  app.post("/api/payments/cashfree/create-order", async (req, res) => {
    try {
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085";
      const response = await fetch(`${backendUrl}/api/payments/cashfree/create-order`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(req.body ?? {}),
      });
      const text = await response.text();
      res.status(response.status);
      res.setHeader("content-type", response.headers.get("content-type") || "application/json");
      res.send(text);
    } catch (error) {
      console.error("Error creating Cashfree order:", error);
      res.status(500).json({ error: "Failed to create Cashfree order" });
    }
  });

  app.get("/api/payments/cashfree/orders/:orderId", async (req, res) => {
    try {
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085";
      const { orderId } = req.params;
      const response = await fetch(`${backendUrl}/api/payments/cashfree/orders/${encodeURIComponent(orderId)}`);
      const text = await response.text();
      res.status(response.status);
      res.setHeader("content-type", response.headers.get("content-type") || "application/json");
      res.send(text);
    } catch (error) {
      console.error("Error fetching Cashfree order:", error);
      res.status(500).json({ error: "Failed to fetch Cashfree order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085";
      const response = await fetch(`${backendUrl}/api/orders`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(req.body ?? {}),
      });
      const text = await response.text();
      res.status(response.status);
      res.setHeader("content-type", response.headers.get("content-type") || "application/json");
      res.send(text);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085";
      const qp = new URLSearchParams();
      for (const [k, v] of Object.entries(req.query)) {
        if (v == null) continue;
        if (Array.isArray(v)) {
          v.forEach((x) => {
            if (x != null) qp.append(k, String(x));
          });
        } else {
          qp.set(k, String(v));
        }
      }
      const url = qp.toString() ? `${backendUrl}/api/orders?${qp.toString()}` : `${backendUrl}/api/orders`;
      const response = await fetch(url);
      const text = await response.text();
      res.status(response.status);
      res.setHeader("content-type", response.headers.get("content-type") || "application/json");
      res.send(text);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085";
      const { id } = req.params;
      const response = await fetch(`${backendUrl}/api/orders/${encodeURIComponent(id)}`);
      const text = await response.text();
      res.status(response.status);
      res.setHeader("content-type", response.headers.get("content-type") || "application/json");
      res.send(text);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/admin/orders", async (req, res) => {
    try {
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085";
      const response = await fetch(`${backendUrl}/api/admin/orders`);
      const text = await response.text();
      res.status(response.status);
      res.setHeader("content-type", response.headers.get("content-type") || "application/json");
      res.send(text);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ error: "Failed to fetch admin orders" });
    }
  });

  app.patch("/api/admin/orders/:id", async (req, res) => {
    try {
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085";
      const { id } = req.params;
      const response = await fetch(`${backendUrl}/api/admin/orders/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(req.body ?? {}),
      });
      const text = await response.text();
      res.status(response.status);
      res.setHeader("content-type", response.headers.get("content-type") || "application/json");
      res.send(text);
    } catch (error) {
      console.error("Error updating admin order:", error);
      res.status(500).json({ error: "Failed to update admin order" });
    }
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/bestsellers", async (req, res) => {
    try {
      const products = await storage.getBestsellerProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bestseller products" });
    }
  });

  app.get("/api/products/new-launches", async (req, res) => {
    try {
      const products = await storage.getNewLaunchProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch new launch products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/filters", async (req, res) => {
    try {
      // Proxy to Spring Boot backend
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085";
      const response = await fetch(`${backendUrl}/api/products/filters`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch filter options" });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching filters:", error);
      res.status(500).json({ error: "Failed to fetch filter options" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
