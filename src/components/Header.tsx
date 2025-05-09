import Link from "next/link";
import { CloudSun as WeatherIcon, Zap, History as HistoryIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ViewedLocationsList from "@/components/ViewedLocationsList";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
        <WeatherIcon size={28} />
          <span>WeatherBuddy</span>
        </Link>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80 focus-visible:ring-offset-primary focus-visible:ring-primary-foreground">
              <HistoryIcon size={24} />
              <span className="sr-only">Viewed Locations</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="end">
            <ViewedLocationsList />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
