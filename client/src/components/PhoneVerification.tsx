import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Phone, Shield } from "lucide-react";
import { phoneVerifySchema, type PhoneVerifyData } from "@shared/schema";

interface PhoneVerificationProps {
  onComplete: (phoneNumber: string) => void;
  onCancel: () => void;
}

export default function PhoneVerification({ onComplete, onCancel }: PhoneVerificationProps) {
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PhoneVerifyData>({
    resolver: zodResolver(phoneVerifySchema),
    defaultValues: {
      phoneNumber: "",
      verificationCode: "",
    },
  });

  const handleSendCode = async (data: { phoneNumber: string }) => {
    setIsLoading(true);
    try {
      // TODO: Implement SMS sending with Twilio or similar service
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhoneNumber(data.phoneNumber);
      setStep("verify");
    } catch (error) {
      console.error("Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (data: PhoneVerifyData) => {
    setIsLoading(true);
    try {
      // TODO: Implement verification with backend
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete(phoneNumber);
    } catch (error) {
      console.error("Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {step === "phone" ? (
            <Phone className="w-6 h-6 text-primary" />
          ) : (
            <Shield className="w-6 h-6 text-primary" />
          )}
        </div>
        <CardTitle>
          {step === "phone" ? "Enter Your Phone Number" : "Verify Your Phone"}
        </CardTitle>
        <CardDescription>
          {step === "phone" 
            ? "We'll send you a verification code to confirm your number"
            : `We sent a 6-digit code to ${phoneNumber}`
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === "phone" ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendCode)} className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        type="tel"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Code"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerifyCode)} className="space-y-4">
              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setStep("phone")}
                >
                  Wrong number? Change it
                </button>
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                  disabled={isLoading || !form.watch("verificationCode") || form.watch("verificationCode").length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-slate-600 hover:text-primary"
                  onClick={() => handleSendCode({ phoneNumber })}
                  disabled={isLoading}
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}