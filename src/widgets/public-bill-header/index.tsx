"use client";

import { Receipt, Share2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PublicGroup, PublicBill } from "@/shared/api/contract/public-bills";

interface PublicBillHeaderProps {
  group: PublicGroup;
  bill: PublicBill;
}

export function PublicBillHeader({ group, bill }: PublicBillHeaderProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${group.name} - Bill Split`,
          text: `Check out the bill breakdown for ${group.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Receipt className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {group.name}
        </h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        {bill.merchantName} •{" "}
        {new Date(bill.date).toLocaleDateString("id-ID")}
      </p>
      <div className="flex items-center justify-center gap-4">
        <Badge
          variant={group.status === "allocated" ? "default" : "secondary"}
        >
          {group.status}
        </Badge>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}