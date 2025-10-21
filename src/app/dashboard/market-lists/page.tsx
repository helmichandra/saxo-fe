"use client";

import { BottomNavigation } from "@/components/dashboard/user-view/BottomNavigation";
import { Card } from "@/components/ui/card";

import TableCoin from "@/app/dashboard/market-lists/tableCoin";


export default function MarketListPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto p-4 max-w-6xl">

          <Card>            
            <TableCoin />
          </Card>
      </div>


      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}