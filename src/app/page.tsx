import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggler";

export default function Home() {
  return (
    <>
      <header className="flex justify-end p-4">
        <ThemeToggle />
      </header>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-3xl gradient-text">
          TokenIt.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Build your token with our simple and intuitive platform. No coding
          required.
        </p>
        <Link href="/launchpad">
          <Button className="px-8 py-6 text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:opacity-90">
            Get Started
          </Button>
        </Link>
      </div>
    </>
  );
}
