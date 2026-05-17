import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AppHeaderProps {
  children?: React.ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/75 shadow-2xl shadow-black/10 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </span>
          <span className="text-xl font-bold tracking-tight">EventOS AI</span>
        </Link>

        {children}
      </nav>
    </header>
  );
}
