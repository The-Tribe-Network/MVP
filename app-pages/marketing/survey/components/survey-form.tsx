"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useWaitlistSurvey } from "@/lib/hooks/use-waitlist";
import {
  waitlistSurveySchema,
  surveyRoleOptions,
  surveyUseCaseOptions,
  surveyPricingOptions,
  type WaitlistSurveyInput,
} from "@/lib/validations/waitlist";
import Link from "next/link";

interface SurveyFormProps {
  email: string;
}

export function SurveyForm({ email }: SurveyFormProps) {
  const { mutate: submitSurvey, isPending, isSuccess } = useWaitlistSurvey();

  const form = useForm<WaitlistSurveyInput>({
    resolver: zodResolver(waitlistSurveySchema),
    defaultValues: {
      email,
      role: undefined,
      roleOther: "",
      useCases: [],
      useCasesOther: "",
      problemToSolve: "",
      willingnessToPay: undefined,
    },
  });

  const selectedRole = useWatch({ control: form.control, name: "role" });
  const selectedUseCases = useWatch({ control: form.control, name: "useCases" });

  const onSubmit = (data: WaitlistSurveyInput) => {
    submitSurvey(data);
  };

  if (isSuccess) {
    return (
      <Card className="text-center py-12">
        <CardContent className="pt-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-6">
            Your feedback helps us build a better product. We'll be in touch soon
            with updates and early access information.
          </p>
          <Link href="/home">
            <Button variant="outline" className="group">
              Learn more about Tribe
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Question 1: Community Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. What type of community do you lead or belong to?</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                    >
                      {surveyRoleOptions.map((option) => (
                        <div key={option.value} className="flex items-start space-x-3">
                          <RadioGroupItem value={option.value} id={`role-${option.value}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`role-${option.value}`} className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedRole === "other" && (
              <FormField
                control={form.control}
                name="roleOther"
                render={({ field }) => (
                  <FormItem className="mt-4 ml-6">
                    <FormControl>
                      <Input placeholder="Please describe your community type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Question 2: Use Cases (Multi-select) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. How do you plan to use Tribe?</CardTitle>
            <FormDescription>Select all that apply</FormDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="useCases"
              render={() => (
                <FormItem>
                  <div className="space-y-3">
                    {surveyUseCaseOptions.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="useCases"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), option.value]
                                    : field.value?.filter((v) => v !== option.value) || [];
                                  field.onChange(newValue);
                                }}
                              />
                            </FormControl>
                            <Label className="font-normal cursor-pointer">
                              {option.label}
                            </Label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedUseCases?.includes("other") && (
              <FormField
                control={form.control}
                name="useCasesOther"
                render={({ field }) => (
                  <FormItem className="mt-4 ml-6">
                    <FormControl>
                      <Input placeholder="Please describe your other use case" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Question 3: Problem to Solve */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. What problem are you hoping to solve?</CardTitle>
            <FormDescription>
              Tell us about the challenges you face with your current tools or what's missing
            </FormDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="problemToSolve"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="For example: 'Our group chat is chaotic and we lose important photos. We need a better way to organize events and keep our memories safe...'"
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Question 4: Willingness to Pay */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4. What would you be willing to pay for a premium plan?</CardTitle>
            <FormDescription>
              Premium features include unlimited storage, advanced permissions, integrations, and more
            </FormDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="willingnessToPay"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                    >
                      {surveyPricingOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-3">
                          <RadioGroupItem value={option.value} id={`pricing-${option.value}`} />
                          <Label htmlFor={`pricing-${option.value}`} className="font-normal cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit Survey"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Your responses are confidential and will only be used to improve Tribe.
        </p>
      </form>
    </Form>
  );
}
