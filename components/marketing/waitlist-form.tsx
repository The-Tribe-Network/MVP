"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useWaitlistSignup } from "@/lib/hooks/use-waitlist";
import { waitlistSchema, type WaitlistInput } from "@/lib/validations/waitlist";
import { CheckCircle2 } from "lucide-react";

interface WaitlistFormProps {
  source?: string;
  variant?: "inline" | "dialog";
  className?: string;
}

export function WaitlistForm({
  source = "unknown",
  variant = "inline",
  className = "",
}: WaitlistFormProps) {
  const { mutate: signup, isPending, isSuccess } = useWaitlistSignup();

  const form = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { email: "", source },
  });

  const onSubmit = (data: WaitlistInput) => {
    signup(data, {
      onSuccess: () => {
        form.reset({ email: "", source });
      },
    });
  };

  if (isSuccess) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <p className="text-lg font-medium text-primary">You're on the list!</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`flex flex-col sm:flex-row gap-3 ${className}`}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className={
                    variant === "inline"
                      ? "h-12 text-base"
                      : ""
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isPending}
          size={variant === "inline" ? "lg" : "default"}
          className="whitespace-nowrap"
        >
          {isPending ? "Joining..." : "Get Early Access"}
        </Button>
      </form>
    </Form>
  );
}
