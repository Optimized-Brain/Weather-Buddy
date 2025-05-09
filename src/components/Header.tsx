import Link from "next/link";
import { Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
          <Zap size={28} />
          <span>WeatherEye</span>
        </Link>
        {/* Future navigation links can go here */}
      </div>
    </header>
  );
}
