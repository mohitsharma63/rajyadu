import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { oliRequest } from "@/lib/oliApi";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await oliRequest("POST", "/api/auth/forgot-password", { email: email.trim() });
      setIsSuccess(true);
      toast({
        title: "Email sent",
        description: "Please check your email for password reset instructions",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
      });
      return;
    }

    try {
      setSendingOtp(true);
      const res = await oliRequest("POST", "/api/auth/forgot-password-by-phone", {
        phone: phone,
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        toast({ title: "OTP sent successfully", description: "Please check your phone for the OTP" });
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
      });
      return;
    }

    try {
      setVerifyingOtp(true);
      const res = await oliRequest("POST", "/api/auth/verify-otp", {
        phone: phone,
        code: otp,
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        toast({ title: "Phone verified successfully" });
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: err instanceof Error ? err.message : "Invalid or expired OTP",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      toast({
        variant: "destructive",
        title: "OTP verification required",
        description: "Please verify your phone number first",
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
      });
      return;
    }

    try {
      setResettingPassword(true);
      const res = await oliRequest("POST", "/api/auth/reset-password", {
        phone: phone,
        otpCode: otp,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Password reset successfully", description: "You can now login with your new password" });
        setTimeout(() => {
          setLocation("/auth/login");
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  if (isSuccess && method === "email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-background dark:from-background dark:to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
                  <p className="mt-2 text-gray-600">
                    We've sent password reset instructions to <strong>{email}</strong>
                  </p>
                </div>
                <div className="pt-4">
                  <Link href="/auth/login">
                    <Button variant="outline">Back to Login</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background dark:from-background dark:to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/logo.png" alt="" className="h-30 w-40" />
            </div>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
            <CardDescription className="text-center">
              Choose a method to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={method} onValueChange={(value) => setMethod(value as "email" | "phone")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                {!otpVerified ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Enter your phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10"
                            required
                            disabled={otpSent}
                          />
                        </div>
                        {!otpSent && (
                          <Button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp || !phone || phone.trim().length < 10}
                            variant="outline"
                          >
                            {sendingOtp ? "Sending..." : "Send OTP"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {otpSent && !otpVerified && (
                      <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                        <Label>Enter OTP</Label>
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(value) => setOtp(value)}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || otp.length !== 6}
                            className="flex-1"
                            variant="outline"
                          >
                            {verifyingOtp ? "Verifying..." : "Verify OTP"}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            variant="ghost"
                          >
                            Resend
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <Button type="submit" className="w-full btn-primary" disabled={resettingPassword}>
                      {resettingPassword ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <Link href="/auth/login" className="inline-flex items-center text-sm text-red-600 hover:text-red-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

