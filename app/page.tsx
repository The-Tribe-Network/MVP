import LandingPageHeader from "@/components/landing-page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { H1, H2, P, Muted } from "@/components/ui/typography"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingPageHeader />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <H1 className="text-4xl md:text-6xl font-bold tracking-tight">Complete Authentication System</H1>
            <P className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A fully-featured authentication system with sign-in, sign-up, password reset, and OAuth integration. Built
              with Next.js, TypeScript, and Tailwind CSS.
            </P>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sign In & Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete authentication forms with email/password and OAuth integration for Google and GitHub.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Password Reset</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Forgot password flow with email verification and secure password reset functionality.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Form Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time form validation with comprehensive error handling and user-friendly feedback.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">OAuth Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Seamless OAuth integration with Google and GitHub for quick and secure authentication.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Auth Routes Demo */}
        <div className="mt-24">
          <H2 className="text-3xl font-bold text-center mb-12">Available Auth Routes</H2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/sign-in">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-center">/sign-in</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Sign in with email/password or OAuth</CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/sign-up">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-center">/sign-up</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Create account with full validation</CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/forgot">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-center">/forgot</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Request password reset email</CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reset?token=demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-center">/reset</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Reset password with token</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <Muted>Built with Next.js, TypeScript, and Tailwind CSS</Muted>
        </div>
      </footer>
    </div>
  )
}
