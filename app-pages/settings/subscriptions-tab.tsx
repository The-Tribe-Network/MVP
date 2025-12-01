'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard } from 'lucide-react'

export function SubscriptionsTab() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border-2 border-primary p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <p className="text-muted-foreground mt-1">
                  Unlimited tribes and advanced features
                </p>
                <p className="text-3xl font-bold mt-4">
                  $9.99<span className="text-lg font-normal text-muted-foreground">/month</span>
                </p>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Current Plan
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Next billing date: January 15, 2025</p>
            <p className="text-sm text-muted-foreground">
              Your subscription will automatically renew
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Payment Method</h3>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/25
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline">Cancel Subscription</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Pro Plan - December 2024</p>
                <p className="text-sm text-muted-foreground">
                  Dec 15, 2024
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">$9.99</span>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Pro Plan - November 2024</p>
                <p className="text-sm text-muted-foreground">
                  Nov 15, 2024
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">$9.99</span>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

