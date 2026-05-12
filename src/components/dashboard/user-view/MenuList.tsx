"use client";

import React from "react";

import { useRouter } from "next/router";

import {
  ArrowRight,
  Wallet,
  LogOut,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { logout } from "@/lib/auth";

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href?: string;
  variant?: "default" | "danger";
  action?: () => void;
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
      title: "Catatan Penarikan dan Isi Ulang",
      icon: <Download className="w-5 h-5" />,
      href: "/dashboard/transactions-user?type=withdraw",
    },
    {
      id: "payment-methods",
      title: "Metode Pembayaran",
      icon: <Wallet className="w-5 h-5" />,
      href: "/dashboard/banks",
    },
    {
      id: "logout",
      title: "Keluar",
      icon: <LogOut className="w-5 h-5" />,
      variant: "danger",
      action: handleLogout,
    },
  ];

  const handleClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
      return;
    }

    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div className="space-y-3">
      {menuItems.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onClick={() => handleClick(item)}
        />
      ))}
    </div>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
  onClick: () => void;
}

function MenuItemCard({
  item,
  onClick,
}: MenuItemCardProps) {
  const isDanger =
    item.variant === "danger";

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`
        w-full
        h-auto
        p-4
        flex
        items-center
        justify-between
        rounded-2xl
        transition-all
        group
        hover:bg-accent
        ${
          isDanger
            ? "hover:bg-destructive/10"
            : ""
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-10
            h-10
            rounded-xl
            flex
            items-center
            justify-center
            transition-colors
            ${
              isDanger
                ? "bg-destructive/10 text-destructive group-hover:bg-destructive/20"
                : "bg-primary/10 text-primary group-hover:bg-primary/20"
            }
          `}
        >
          {item.icon}
        </div>

        <span
          className={`font-medium ${
            isDanger
              ? "text-destructive"
              : "text-foreground"
          }`}
        >
          {item.title}
        </span>
      </div>

      <ArrowRight
        className={`
          w-5
          h-5
          text-muted-foreground
          transition-all
          group-hover:translate-x-1
          ${
            isDanger
              ? "group-hover:text-destructive"
              : "group-hover:text-primary"
          }
        `}
      />
    </Button>
  );
}