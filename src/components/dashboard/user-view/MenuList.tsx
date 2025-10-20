import { useRouter } from "next/navigation";
import { ArrowRight, Wallet, LogOut, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}

export function MenuList() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/signin");
  };

  const menuItems: MenuItem[] = [
    {
      id: "withdraw-history",
      title: "Catatan Penarikan",
      icon: <Download className="w-5 h-5" />,
      onClick: () => router.push("/dashboard/transactions?type=withdraw"),
    },
    {
      id: "deposit-history",
      title: "Catatan Isi Ulang",
      icon: <Upload className="w-5 h-5" />,
      onClick: () => router.push("/dashboard/transactions?type=deposit"),
    },
    {
      id: "payment-methods",
      title: "Metode Pembayaran",
      icon: <Wallet className="w-5 h-5" />,
      onClick: () => router.push("/dashboard/banks"),
    },
    {
      id: "logout",
      title: "Keluar",
      icon: <LogOut className="w-5 h-5" />,
      onClick: handleLogout,
      variant: "danger",
    },
  ];

  return (
    <div className="space-y-2">
      {menuItems.map((item) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
}

function MenuItemCard({ item }: MenuItemCardProps) {
  const isDanger = item.variant === "danger";

  return (
    <Button
      onClick={item.onClick}
      variant="ghost"
      className={`w-full p-4 h-auto justify-between transition-all hover:bg-accent group ${
        isDanger ? "hover:bg-destructive/10" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            isDanger
              ? "bg-destructive/10 text-destructive group-hover:bg-destructive/20"
              : "bg-primary/10 text-primary group-hover:bg-primary/20"
          }`}
        >
          {item.icon}
        </div>
        <span
          className={`font-medium ${
            isDanger ? "text-destructive" : ""
          }`}
        >
          {item.title}
        </span>
      </div>
      <ArrowRight
        className={`w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform ${
          isDanger ? "group-hover:text-destructive" : "group-hover:text-primary"
        }`}
      />
    </Button>
  );
}