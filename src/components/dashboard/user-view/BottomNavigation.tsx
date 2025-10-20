"use client";
import { useRouter, usePathname } from "next/navigation";
import { Home, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      id: "market",
      label: "Pasar",
      icon: <Home className="w-5 h-5" />,
      path: "/dashboard/market-lists",
    },
    {
      id: "orders",
      label: "Trading",
      icon: <TrendingUp className="w-5 h-5" />,
      path: "/dashboard/user-markets",
    },
    {
      id: "profile",
      label: "Profil",
      icon: <User className="w-5 h-5" />,
      path: "/dashboard/user-view",
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg backdrop-blur-sm z-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-around items-center px-4 py-3">
          {navItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => router.push(item.path)}
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1.5 h-auto py-2 px-4 rounded-lg transition-all",
                isActive(item.path)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <div
                className={cn(
                  "transition-transform",
                  isActive(item.path) && "scale-110"
                )}
              >
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}