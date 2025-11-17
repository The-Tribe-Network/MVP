import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/forms/reset-password-form"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const queryParams = await searchParams;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
