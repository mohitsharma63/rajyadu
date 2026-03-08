import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import AdminLayout from "@/components/admin-layout";
import AdminProtectedRoute from "@/components/admin-protected-route";
import Home from "@/pages/home";
import Category from "@/pages/category";
import ProductDetail from "@/pages/product-detail";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import TermsConditions from "@/pages/terms-conditions";
import PrivacyPolicy from "@/pages/privacy-policy";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgot-password";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout"; // Uncomment this line if you have a Checkout page
// import Checkout from "@/pages/checkout"
import Wishlist from "@/pages/wishlist";
import OrdersHistory from "@/pages/account/orders";
import ChangePassword from "@/pages/account/change-password";
import SearchPage from "@/pages/search";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import AdminSubCategories from "@/pages/admin/subcategories";
import AdminSliders from "@/pages/admin/sliders";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import AdminSettings from "@/pages/admin/settings";
import AdminTermsConditions from "@/pages/admin/terms-conditions";
import AdminLogin from "@/pages/admin/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/admin/login">
        <AdminLogin />
      </Route>
      <Route path="/admin">
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/products">
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminProducts />
          </AdminLayout>
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/categories">
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminCategories />
          </AdminLayout>
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/subcategories">
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminSubCategories />
          </AdminLayout>
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/sliders">
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminSliders />
          </AdminLayout>
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/orders">
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminOrders />
          </AdminLayout>
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/customers">
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminCustomers />
          </AdminLayout>
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/terms-conditions">
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminTermsConditions />
          </AdminLayout>
        </AdminProtectedRoute>
      </Route>

      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/category/:slug" component={Category} />
            <Route path="/product/:slug" component={ProductDetail} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/terms-conditions" component={TermsConditions} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/auth/login" component={Login} />
            <Route path="/auth/signup" component={Signup} />
            <Route path="/auth/forgot-password" component={ForgotPassword} />
            <Route path="/account/orders" component={OrdersHistory} />
            <Route path="/account/change-password" component={ChangePassword} />
            <Route path="/search" component={SearchPage} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/wishlist" component={Wishlist} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
