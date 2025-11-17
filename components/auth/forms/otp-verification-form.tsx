"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Mail, Clock } from "lucide-react";
import { P } from "@/components/ui/typography";
import { OTPVerificationType } from "@/lib/constants/auth";

type VerificationState = "idle" | "success" | "error";

interface OTPVerificationFormProps {
  type: OTPVerificationType
};

export function OTPVerificationForm({ type }: OTPVerificationFormProps) {
  const [otp, setOtp] = useState("");
  const [verificationState, setVerificationState] =
    useState<VerificationState>("idle");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  const CORRECT_OTP = "123456";

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (otp.length === 6) {
      handleVerification();
    }
  }, [otp]);

  const handleVerification = async () => {
    setIsVerifying(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (otp === CORRECT_OTP) {
      setVerificationState("success");
    } else {
      setVerificationState("error");
      setTimeout(() => {
        setOtp("");
        setVerificationState("idle");
      }, 2000);
    }

    setIsVerifying(false);
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;

    setOtp("");
    setVerificationState("idle");
    setResendCooldown(30);

    console.log("New verification code sent!");
  };

  const getOTPClassName = () => {
    if (verificationState === "success") {
      return "border-success bg-success/5";
    }
    if (verificationState === "error") {
      return "border-destructive bg-destructive/5";
    }
    return "";
  };

  const getStatusIcon = () => {
    if (verificationState === "success") {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }
    if (verificationState === "error") {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    return null;
  };

  const getStatusMessage = () => {
    if (verificationState === "success") {
      return "Verification successful!";
    }
    if (verificationState === "error") {
      return "Invalid code. Please try again.";
    }
    return null;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isVerifying || verificationState === "success"}
            className={cn("gap-2", getOTPClassName())}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot
                index={0}
                className={cn(
                  "w-12 h-12 text-lg font-semibold transition-all duration-200",
                  getOTPClassName()
                )}
              />
              <InputOTPSlot
                index={1}
                className={cn(
                  "w-12 h-12 text-lg font-semibold transition-all duration-200",
                  getOTPClassName()
                )}
              />
              <InputOTPSlot
                index={2}
                className={cn(
                  "w-12 h-12 text-lg font-semibold transition-all duration-200",
                  getOTPClassName()
                )}
              />
              <InputOTPSlot
                index={3}
                className={cn(
                  "w-12 h-12 text-lg font-semibold transition-all duration-200",
                  getOTPClassName()
                )}
              />
              <InputOTPSlot
                index={4}
                className={cn(
                  "w-12 h-12 text-lg font-semibold transition-all duration-200",
                  getOTPClassName()
                )}
              />
              <InputOTPSlot
                index={5}
                className={cn(
                  "w-12 h-12 text-lg font-semibold transition-all duration-200",
                  getOTPClassName()
                )}
              />
            </InputOTPGroup>
          </InputOTP>

          {(verificationState === "success" ||
            verificationState === "error") && (
              <div className="flex items-center space-x-2 animate-in fade-in-0 duration-300">
                {getStatusIcon()}
                <span
                  className={cn(
                    "text-sm font-medium",
                    verificationState === "success"
                      ? "text-success"
                      : "text-destructive"
                  )}
                >
                  {getStatusMessage()}
                </span>
              </div>
            )}
        </div>

        {isVerifying && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
              <span className="text-sm">Verifying...</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center space-y-3 mt-4">
        <P className="text-sm text-muted-foreground">
          Didn't receive the code?
        </P>
        <Button
          variant="outline"
          onClick={handleResendCode}
          disabled={
            resendCooldown > 0 || isVerifying || verificationState === "success"
          }
          className="w-full cursor-pointer"
        >
          {resendCooldown > 0 ? (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Resend in {resendCooldown}s</span>
            </div>
          ) : (
            "Resend Code"
          )}
        </Button>
      </div>
    </>
  );
}
