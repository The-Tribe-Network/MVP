'use client'

import type { Control } from 'react-hook-form'
import { Lock, Globe } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import type { CreateTribeFormInput } from '@/lib/validations/tribe'

interface PrivacyStepProps {
  control: Control<CreateTribeFormInput>
}

export function PrivacyStep({ control }: PrivacyStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="privacy"
        render={({ field }) => (
          <FormItem>
            <RadioGroup value={field.value} onValueChange={field.onChange}>
              <div className="space-y-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    field.value === 'private'
                      ? 'border-primary bg-primary/5'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                  onClick={() => field.onChange('private')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value="private" id="private" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="h-5 w-5" />
                          <Label htmlFor="private" className="text-lg font-semibold cursor-pointer">
                            Private
                          </Label>
                          <Badge variant="secondary" className="ml-2">
                            Recommended
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Only invited members can see and join your tribe. Perfect for close friends and family.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    field.value === 'public'
                      ? 'border-primary bg-primary/5'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                  onClick={() => field.onChange('public')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value="public" id="public" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="h-5 w-5" />
                          <Label htmlFor="public" className="text-lg font-semibold cursor-pointer">
                            Public
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Anyone can discover and join your tribe. Great for communities and interest groups.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
