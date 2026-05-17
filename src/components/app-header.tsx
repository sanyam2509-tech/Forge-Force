import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AppHeaderProps {
  children?: React.ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <span className="text-xl font-bold">EventOS AI</span>
        </Link>

        {children}
      </nav>
    </header>
  );
}
