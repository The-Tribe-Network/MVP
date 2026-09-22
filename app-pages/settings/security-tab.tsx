'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Smartphone, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/clients/auth-client'
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations/security'
import { useChangePassword, useSessions, useRevokeSession, useRevokeOtherSessions } from '@/lib/hooks/use-security'
import { formatRelativeTime } from '@/lib/utils'
import { PasswordRequirementsIndicator } from '@/app-pages/auth/forms/password-requirements-indicator'

export function SecurityTab() {
  const [connectedAccounts, setConnectedAccounts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Hooks for password and sessions
  const changePasswordMutation = useChangePassword()
  const { data: sessions, isLoading: sessionsLoading } = useSessions()
  const revokeSessionMutation = useRevokeSession()
  const revokeOtherSessionsMutation = useRevokeOtherSessions()

  // Form for password change
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: true,
    },
  })

  // Watch form values for real-time validation
  const newPassword = passwordForm.watch('newPassword')
  const confirmPassword = passwordForm.watch('confirmPassword')

  // Clear confirmPassword error in real-time when passwords match
  useEffect(() => {
    if (
      newPassword &&
      confirmPassword &&
      newPassword === confirmPassword &&
      passwordForm.formState.errors.confirmPassword
    ) {
      passwordForm.clearErrors('confirmPassword')
    }
  }, [newPassword, confirmPassword, passwordForm])

  const onPasswordSubmit = (data: ChangePasswordInput) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        passwordForm.reset()
      },
    })
  }

  const handleConnect = async (provider: 'google' | 'discord') => {
    setLoading((prev) => ({ ...prev, [provider]: true }))
    try {
      await authClient.linkSocial({
        provider,
        callbackURL: '/settings?tab=security',
      })
      // Note: After successful connection, the callback will redirect back
      // The actual connection status should be fetched from the server
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error)
      setLoading((prev) => ({ ...prev, [provider]: false }))
    }
  }

  const handleDisconnect = async (provider: 'google' | 'discord') => {
    setLoading((prev) => ({ ...prev, [provider]: true }))
    try {
      // better-auth 1.7 unlinks by account row id, not provider name
      const linked = await authClient.listAccounts()
      const account = linked.data?.find((a: any) => (a.providerId || a.provider) === provider)
      if (!account) throw new Error(`No linked ${provider} account`)
      await authClient.unlinkAccount({ accountId: account.id })
      // Refresh the accounts list to ensure accurate state
      const accounts = await authClient.listAccounts()
      if (accounts.data && accounts.data.length > 0) {
        const providerSet = new Set<string>()
        accounts.data.forEach((account: any) => {
          const provider = account.providerId || account.provider
          if (provider === 'google' || provider === 'discord') {
            providerSet.add(provider)
          }
        })
        setConnectedAccounts(providerSet)
      }
    } catch (error) {
      console.error(`Failed to disconnect ${provider}:`, error)
    } finally {
      setLoading((prev) => ({ ...prev, [provider]: false }))
    }
  }

  const isConnected = (provider: string) => connectedAccounts.has(provider)
  const isLoading = (provider: string) => loading[provider] ?? false

  useEffect(() => {
    const fetchConnectedAccounts = async () => {
      try {
        const accounts = await authClient.listAccounts()
        if (accounts.data && accounts.data.length > 0) {
          const providerSet = new Set<string>()
          accounts.data.forEach((account: any) => {
            const provider = account.providerId || account.provider
            if (provider === 'google' || provider === 'discord') {
              providerSet.add(provider)
            }
          })
          setConnectedAccounts(providerSet)
        }
      } catch (error) {
        console.error('Failed to fetch connected accounts:', error)
      }
    }

    fetchConnectedAccounts()
  }, [])

  const handleRevokeSession = (sessionToken: string) => {
    revokeSessionMutation.mutate(sessionToken)
  }

  const handleRevokeAllOtherSessions = () => {
    revokeOtherSessionsMutation.mutate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password & Security</CardTitle>
        <CardDescription>
          Keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Change Password</h3>

          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <PasswordRequirementsIndicator password={newPassword || ''} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </Form>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Integrations</h3>

          <div className="space-y-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Google</p>
                      <p className="text-sm text-muted-foreground">
                        {isConnected('google')
                          ? 'Your Google account is connected'
                          : 'Connect your Google account for seamless access'}
                      </p>
                    </div>
                    {isConnected('google') ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect('google')}
                        disabled={isLoading('google')}
                      >
                        {isLoading('google') ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          'Disconnect'
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnect('google')}
                        disabled={isLoading('google')}
                      >
                        {isLoading('google') ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.396-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.975 14.975 0 0 0 1.293-2.1a.07.07 0 0 0-.038-.098a13.11 13.11 0 0 1-1.872-.892a.072.072 0 0 1-.007-.12a10.149 10.149 0 0 0 .372-.294a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.294a.072.072 0 0 1-.006.12a12.296 12.296 0 0 1-1.873.892a.077.077 0 0 0-.041.098c.36.698.772 1.362 1.293 2.1a.074.074 0 0 0 .084.028a19.963 19.963 0 0 0 6.002-3.03a.079.079 0 0 0 .033-.057c.5-4.565-.838-8.628-3.549-12.193a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.964-2.157 2.157-2.157c1.193 0 2.156.964 2.156 2.157c0 1.191-.963 2.156-2.156 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.964-2.157 2.157-2.157c1.192 0 2.156.964 2.156 2.157c0 1.191-.964 2.156-2.156 2.156z" />
                  </svg>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Discord</p>
                      <p className="text-sm text-muted-foreground">
                        {isConnected('discord')
                          ? 'Your Discord account is connected'
                          : 'Connect your Discord account for enhanced features'}
                      </p>
                    </div>
                    {isConnected('discord') ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect('discord')}
                        disabled={isLoading('discord')}
                      >
                        {isLoading('discord') ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          'Disconnect'
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnect('discord')}
                        disabled={isLoading('discord')}
                      >
                        {isLoading('discord') ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Active Sessions</h3>

          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions && sessions.length > 0 ? (
            <>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div key={session.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{session.deviceName}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.location
                              ? `${session.location} • `
                              : ''}
                            {session.isCurrentSession
                              ? 'Current session'
                              : `Last active ${formatRelativeTime(session.lastActive)}`}
                          </p>
                        </div>
                      </div>
                      {session.isCurrentSession ? (
                        <span className="text-xs text-green-500">Active</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.token)}
                          disabled={revokeSessionMutation.isPending}
                        >
                          {revokeSessionMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Revoking...
                            </>
                          ) : (
                            'Revoke'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {sessions.filter((s) => !s.isCurrentSession).length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleRevokeAllOtherSessions}
                  disabled={revokeOtherSessionsMutation.isPending}
                >
                  {revokeOtherSessionsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    'Sign Out All Devices'
                  )}
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No active sessions</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

