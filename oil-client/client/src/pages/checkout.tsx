
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/use-cart";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { oliAssetUrl } from "@/lib/oliApi";

declare const Cashfree: any;

 const INDIA_STATES_UTS: Array<{ value: string; label: string }> = [
   { value: "andaman-and-nicobar-islands", label: "Andaman and Nicobar Islands" },
   { value: "andhra-pradesh", label: "Andhra Pradesh" },
   { value: "arunachal-pradesh", label: "Arunachal Pradesh" },
   { value: "assam", label: "Assam" },
   { value: "bihar", label: "Bihar" },
   { value: "chandigarh", label: "Chandigarh" },
   { value: "chhattisgarh", label: "Chhattisgarh" },
   { value: "dadra-and-nagar-haveli-and-daman-and-diu", label: "Dadra and Nagar Haveli and Daman and Diu" },
   { value: "delhi", label: "Delhi" },
   { value: "goa", label: "Goa" },
   { value: "gujarat", label: "Gujarat" },
   { value: "haryana", label: "Haryana" },
   { value: "himachal-pradesh", label: "Himachal Pradesh" },
   { value: "jammu-and-kashmir", label: "Jammu and Kashmir" },
   { value: "jharkhand", label: "Jharkhand" },
   { value: "karnataka", label: "Karnataka" },
   { value: "kerala", label: "Kerala" },
   { value: "ladakh", label: "Ladakh" },
   { value: "lakshadweep", label: "Lakshadweep" },
   { value: "madhya-pradesh", label: "Madhya Pradesh" },
   { value: "maharashtra", label: "Maharashtra" },
   { value: "manipur", label: "Manipur" },
   { value: "meghalaya", label: "Meghalaya" },
   { value: "mizoram", label: "Mizoram" },
   { value: "nagaland", label: "Nagaland" },
   { value: "odisha", label: "Odisha" },
   { value: "puducherry", label: "Puducherry" },
   { value: "punjab", label: "Punjab" },
   { value: "rajasthan", label: "Rajasthan" },
   { value: "sikkim", label: "Sikkim" },
   { value: "tamil-nadu", label: "Tamil Nadu" },
   { value: "telangana", label: "Telangana" },
   { value: "tripura", label: "Tripura" },
   { value: "uttar-pradesh", label: "Uttar Pradesh" },
   { value: "uttarakhand", label: "Uttarakhand" },
   { value: "west-bengal", label: "West Bengal" },
 ];

function toNumber(v: string | number | undefined): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { add: addOrder } = useOrders();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [shippingCharge, setShippingCharge] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Shipping Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    // Payment Info
    paymentMethod: "online",
    onlineMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    // UPI
    upiId: "",
    // Billing
    sameAsShipping: true
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  const isCod = formData.paymentMethod === "cod";

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => {
      const next = { ...prev };
      if (!String(next.firstName || "").trim() && String((user as any)?.firstName || "").trim()) {
        next.firstName = String((user as any)?.firstName || "");
      }
      if (!String(next.lastName || "").trim() && String((user as any)?.lastName || "").trim()) {
        next.lastName = String((user as any)?.lastName || "");
      }
      if (!String(next.email || "").trim() && String((user as any)?.email || "").trim()) {
        next.email = String((user as any)?.email || "");
      }
      if (!String(next.phone || "").trim() && String((user as any)?.phone || "").trim()) {
        next.phone = String((user as any)?.phone || "");
      }
      return next;
    });
  }, [user]);
  const computedWeightKg = useMemo(() => {
    const count = items.reduce((acc, it) => acc + (it.quantity ?? 0), 0);
    return Math.max(0.5, count * 0.5);
  }, [items]);

  useEffect(() => {
    const pincodeOk = /^[1-9]\d{5}$/.test(formData.pincode.trim());
    if (!pincodeOk) {
      setShippingCharge(null);
      setShippingError(null);
      return;
    }

    const controller = new AbortController();
    setShippingLoading(true);
    setShippingError(null);

    const qp = new URLSearchParams({
      deliveryPincode: formData.pincode.trim(),
      weight: String(computedWeightKg),
      cod: String(isCod),
      productMrp: String(subtotal),
    });

    fetch(`/api/ithink/serviceability?${qp.toString()}`, { signal: controller.signal })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.message || data?.error || "Failed to fetch shipping");
        return data;
      })
      .then((data) => {
        if (data?.serviceable) {
          const n = toNumber(data?.shippingCharge);
          setShippingCharge(Number.isFinite(n) ? n : 0);
          setShippingError(null);
        } else {
          setShippingCharge(99);
          setShippingError(data?.message || "Not serviceable");
        }
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setShippingCharge(99);
        setShippingError(e?.message || "Failed to fetch shipping");
      })
      .finally(() => setShippingLoading(false));

    return () => controller.abort();
  }, [formData.pincode, computedWeightKg, isCod, subtotal]);

  const shipping = shippingCharge ?? 0;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      const nextErrors: Partial<Record<keyof typeof formData, string>> = {};
      const emailOk = /^\S+@\S+\.\S+$/.test(formData.email.trim());
      const pincodeOk = /^[1-9]\d{5}$/.test(formData.pincode.trim());

      if (!formData.firstName.trim()) nextErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) nextErrors.lastName = "Last name is required";
      if (!formData.email.trim()) nextErrors.email = "Email is required";
      else if (!emailOk) nextErrors.email = "Enter a valid email";
      if (!formData.phone.trim()) nextErrors.phone = "Phone is required";
      if (!formData.address.trim()) nextErrors.address = "Address is required";
      if (!formData.city.trim()) nextErrors.city = "City is required";
      if (!formData.state.trim()) nextErrors.state = "State is required";
      if (!formData.pincode.trim()) nextErrors.pincode = "Pincode is required";
      else if (!pincodeOk) nextErrors.pincode = "Enter a valid 6-digit pincode";

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }

    if (step < 3) setStep(step + 1);
  };

  const handlePlaceOrder = async () => {
    const placeErrors: Partial<Record<keyof typeof formData, string>> = {};
    const emailOk = /^\S+@\S+\.\S+$/.test(formData.email.trim());
    const pincodeOk = /^[1-9]\d{5}$/.test(formData.pincode.trim());
    if (!formData.firstName.trim()) placeErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) placeErrors.lastName = "Last name is required";
    if (!formData.email.trim()) placeErrors.email = "Email is required";
    else if (!emailOk) placeErrors.email = "Enter a valid email";
    if (!formData.phone.trim()) placeErrors.phone = "Phone is required";
    if (!formData.address.trim()) placeErrors.address = "Address is required";
    if (!formData.city.trim()) placeErrors.city = "City is required";
    if (!formData.state.trim()) placeErrors.state = "State is required";
    if (!formData.pincode.trim()) placeErrors.pincode = "Pincode is required";
    else if (!pincodeOk) placeErrors.pincode = "Enter a valid 6-digit pincode";
    setErrors(placeErrors);
    if (Object.keys(placeErrors).length > 0) {
      setStep(1);
      return;
    }

    setPayError(null);

    if (formData.paymentMethod === "online") {
      try {
        setPayLoading(true);
        const returnUrl = `${window.location.origin}/payment/cashfree/return?order_id={order_id}`;
        const resp = await fetch("/api/payments/cashfree/create-order", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            amount: total,
            currency: "INR",
            customerId: formData.email.trim() || undefined,
            customerName: `${formData.firstName} ${formData.lastName}`.trim(),
            customerEmail: formData.email.trim(),
            customerPhone: formData.phone.trim(),
            returnUrl,
            orderNote: "Order payment",
          }),
        });

        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data?.message || data?.error || "Failed to create payment order");
        }

        const paymentSessionId = data?.paymentSessionId;
        const cashfreeOrderId = data?.orderId;
        if (!paymentSessionId || !cashfreeOrderId) {
          throw new Error("Invalid payment session response");
        }

        window.localStorage.setItem(
          "poppik:cashfree:pending:v1",
          JSON.stringify({
            cashfreeOrderId,
            createdAt: new Date().toISOString(),
            items,
            subtotal,
            shipping,
            total,
            userEmail: formData.email,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: formData.phone,
            address: formData.address,
            apartment: formData.apartment,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          })
        );

        const mode = ((import.meta as any)?.env?.VITE_CASHFREE_MODE as string) || "sandbox";
        const cashfree = typeof Cashfree === "function" ? Cashfree({ mode }) : null;
        if (!cashfree) {
          throw new Error("Cashfree SDK not loaded");
        }

        await cashfree.checkout({ paymentSessionId, redirectTarget: "_self" });
        return;
      } catch (e: any) {
        setPayError(e?.message || "Failed to start payment");
      } finally {
        setPayLoading(false);
      }
      return;
    }

    try {
      setPayLoading(true);
      const resp = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          customerEmail: formData.email.trim(),
          customerPhone: formData.phone.trim(),
          shippingAddress: [formData.address, formData.apartment].filter(Boolean).join(", "),
          shippingCity: formData.city.trim(),
          shippingState: formData.state.trim(),
          shippingPincode: formData.pincode.trim(),
          subtotal,
          shipping,
          total,
          paymentMethod: "cod",
          paymentStatus: "unpaid",
          status: "Pending",
          items: items.map((it) => ({
            productId: it.product.id,
            productName: it.product.name,
            variant: it.selectedVariant ?? null,
            quantity: it.quantity ?? 0,
            unitPrice: toNumber(it.product.price),
          })),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || data?.error || "Failed to create order");

      setConfirmedOrderId(data?.id ?? null);
      addOrder({
        id: data?.id ?? "",
        createdAt: data?.createdAt ?? new Date().toISOString(),
        items,
        subtotal,
        shipping,
        total,
        userEmail: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        status: data?.status ?? "Pending",
      });
      clear();
      setStep(3);
    } catch (e: any) {
      setPayError(e?.message || "Failed to create order");
    } finally {
      setPayLoading(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Truck className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add items to your cart before checkout.</p>
            <Link href="/">
              <Button className="btn-primary">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Order Confirmed!</h2>
            <p className="text-gray-600">
              Thank you for your purchase. Your order #{confirmedOrderId ?? ""} has been confirmed.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estimated delivery</p>
              <p className="font-semibold">3-5 business days</p>
            </div>
            <div className="space-y-3 pt-4">
              <Link href={confirmedOrderId ? `/account/orders/${encodeURIComponent(confirmedOrderId)}` : "/account/orders"}>
                <Button className="w-full btn-primary">
                  Track Your Order
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        autoComplete="given-name"
                        required
                      />
                      {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        autoComplete="family-name"
                        required
                      />
                      {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="email"
                        disabled={isLoggedIn}
                        required
                      />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        autoComplete="tel"
                        required
                      />
                      {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      autoComplete="street-address"
                      required
                    />
                    {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                    <Input
                      id="apartment"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      autoComplete="address-line2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        autoComplete="address-level2"
                        required
                      />
                      {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, state: value }));
                          setErrors(prev => ({ ...prev, state: undefined }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIA_STATES_UTS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, "");
                          setFormData(prev => ({ ...prev, pincode: onlyDigits.slice(0, 6) }));
                          setErrors(prev => ({ ...prev, pincode: undefined }));
                        }}
                        inputMode="numeric"
                        maxLength={6}
                        autoComplete="postal-code"
                        required
                      />
                      {errors.pincode && <p className="text-sm text-red-600">{errors.pincode}</p>}
                    </div>
                  </div>

                  <Button onClick={handleNext} className="w-full btn-primary">
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex-1">Online Payment</Label>
                      
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1">Cash on Delivery</Label>
                    </div>
                  </RadioGroup>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>

                  {payError && <p className="text-sm text-red-600">{payError}</p>}

                  <Button onClick={handlePlaceOrder} className="w-full btn-primary" disabled={payLoading}>
                    Place Order - ₹{total.toLocaleString()}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.product.id}:${item.selectedVariant ?? ""}`} className="flex items-center space-x-3">
                      <img
                        src={oliAssetUrl(item.product.imageUrl) ?? item.product.imageUrl}
                        alt={item.product.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">
                        ₹{(toNumber(item.product.price) * (item.quantity ?? 0)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className={shipping === 0 ? "text-green-600" : undefined}>
                      {shippingLoading
                        ? "Calculating…"
                        : shippingCharge != null
                          ? shipping === 0
                            ? "FREE"
                            : `₹${shipping.toLocaleString()}`
                          : shippingError
                            ? "Unavailable"
                            : shipping === 0
                              ? "FREE"
                              : `₹${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>Included</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                {/* Delivery Info */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center text-sm text-green-700">
                    <Truck className="h-4 w-4 mr-2" />
                    <span>
                      {shippingError
                        ? shippingError
                        : shippingLoading
                          ? "Checking delivery availability…"
                          : "Free delivery in 3-5 business days"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
