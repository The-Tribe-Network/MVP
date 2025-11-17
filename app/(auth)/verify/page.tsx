import { OTPVerificationForm } from "@/components/auth/forms/otp-verification-form";
import { OTP_VERIFICATION_TYPES } from "@/lib/constants/auth";
import type { OTPVerificationType } from "@/lib/constants/auth";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function VerifyPage({ searchParams }: PageProps) {
  const { type } = await searchParams as { type: OTPVerificationType };

  if (type && !OTP_VERIFICATION_TYPES.includes(type)) {
    return redirect("/sign-in");
  }else if (!type) {
    return redirect("/sign-in");
  }

  return <OTPVerificationForm type={type} />
}