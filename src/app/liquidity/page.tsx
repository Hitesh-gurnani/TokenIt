import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggler";

function Liquidity() {
  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8 md:py-12">
      <header className="flex justify-between items-center p-4 max-w-screen-lg mx-auto">
        <Link href="/" className="text-xl font-bold">
          TokenIt
        </Link>
        <ThemeToggle />
      </header>
      <div className="text-center py-16">
        <h1 className="gradient-text font-bold text-3xl mb-4">
          Liquidity pool creation
        </h1>
        <p className="text-muted-foreground text-xl mb-2">Coming Soon</p>
      </div>
    </div>
  );
}

export default Liquidity;
