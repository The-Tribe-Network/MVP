'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Shield, UserPlus, Users, X, Crown, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const permissionSettingsSchema = z.object({
  editPermission: z.enum(['creator_only', 'creator_and_admins', 'all_members']),
})

type PermissionSettingsInput = z.infer<typeof permissionSettingsSchema>

interface PermissionsSectionProps {
  tribeId: string
  eventId: string
}

// Mock data for demonstration
const mockCoHosts = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    image: null,
    addedBy: 'Event Creator',
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    image: null,
    addedBy: 'Event Creator',
  },
]

const mockMembers = [
  { id: 'm1', name: 'Alice Brown', email: 'alice@example.com', image: null },
  { id: 'm2', name: 'Bob Wilson', email: 'bob@example.com', image: null },
  { id: 'm3', name: 'Carol Davis', email: 'carol@example.com', image: null },
]

export function PermissionsSection({ tribeId, eventId }: PermissionsSectionProps) {
  const form = useForm<PermissionSettingsInput>({
    resolver: zodResolver(permissionSettingsSchema),
    defaultValues: {
      editPermission: 'creator_and_admins',
    },
  })

  const onSubmit = (data: PermissionSettingsInput) => {
    // TODO: Implement API call when ready
    console.log('Updating permission settings:', { tribeId, eventId, data })
    toast.success('Permission settings updated successfully')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Permissions</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Control who can edit and manage this event
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Edit Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Edit className="h-4 w-4" />
                Edit Permissions
              </CardTitle>
              <CardDescription>
                Choose who can make changes to this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="editPermission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Who Can Edit This Event</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select permission level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="creator_only">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            <span>Creator Only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="creator_and_admins">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>Creator & Tribe Admins</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="all_members">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>All Tribe Members</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Co-hosts always have edit access regardless of this setting
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Co-Hosts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4" />
                Co-Hosts
              </CardTitle>
              <CardDescription>
                Add members who can help manage this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCoHosts.length > 0 ? (
                <div className="space-y-3">
                  {mockCoHosts.map((coHost) => (
                    <div
                      key={coHost.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={coHost.image || undefined} />
                          <AvatarFallback>{getInitials(coHost.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{coHost.name}</p>
                          <p className="text-sm text-muted-foreground">{coHost.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Co-Host</Badge>
                        <Button variant="ghost" size="icon">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No co-hosts added yet</p>
                </div>
              )}

              <div className="pt-4">
                <p className="text-sm font-medium mb-3">Add Co-Host</p>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member to add as co-host" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Access Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Access Summary
              </CardTitle>
              <CardDescription>
                Who currently has access to manage this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Event Creator</span>
                  </div>
                  <Badge>Full Access</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Co-Hosts ({mockCoHosts.length})</span>
                  </div>
                  <Badge variant="secondary">Edit Access</Badge>
                </div>
                {form.watch('editPermission') === 'creator_and_admins' && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Tribe Admins</span>
                    </div>
                    <Badge variant="secondary">Edit Access</Badge>
                  </div>
                )}
                {form.watch('editPermission') === 'all_members' && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">All Members</span>
                    </div>
                    <Badge variant="secondary">Edit Access</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
