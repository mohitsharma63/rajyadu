
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
import { oliAssetUrl } from "@/lib/oliApi";

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
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [shippingCharge, setShippingCharge] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
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
    paymentMethod: "card",
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

  const handlePlaceOrder = () => {
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

    // Process order
    const now = new Date();
    const orderId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}-${Math.random().toString(16).slice(2, 8)}`;
    addOrder({
      id: orderId,
      createdAt: now.toISOString(),
      items,
      subtotal,
      shipping,
      total,
      userEmail: formData.email,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      status: "confirmed",
    });
    clear();
    setStep(3);
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
              Thank you for your purchase. Your order #DP2024001 has been confirmed.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estimated delivery</p>
              <p className="font-semibold">3-5 business days</p>
            </div>
            <div className="space-y-3 pt-4">
              <Link href="/account/orders">
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
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1">Credit/Debit Card</Label>
                      <div className="flex space-x-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1">UPI Payment</Label>
                      <div className="flex space-x-2">
                        <img src="https://logoeps.com/wp-content/uploads/2013/03/paytm-vector-logo.png" alt="Paytm" className="h-6" />
                        <img src="https://logoeps.com/wp-content/uploads/2013/03/google-pay-vector-logo.png" alt="GPay" className="h-6" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1">Cash on Delivery</Label>
                      <span className="text-sm text-green-600">₹50 extra</span>
                    </div>
                  </RadioGroup>

                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'upi' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          name="upiId"
                          placeholder="yourname@paytm"
                          value={formData.upiId}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>

                  <Button onClick={handlePlaceOrder} className="w-full btn-primary">
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
