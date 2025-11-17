import Link from "next/link";
import { H1 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function LandingPageHeader() {
  return (
    <header className="border-b">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <Link href="/">
        <H1 className="text-2xl font-bold">AuthApp</H1>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/sign-in">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/sign-up">
          <Button>Get Started</Button>
        </Link>
      </div>
    </div>
  </header>
  );
};
