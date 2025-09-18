import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Plus, Users, Receipt, Share2 } from "lucide-react";
import Link from "next/link";

// Mock data - replace with actual database query
const settlements = [
  {
    id: "1",
    merchant_name: "McDonald's",
    total_amount: 150000,
    date: "2024-01-15",
    status: "outstanding", // no members added yet
    member_count: 0,
    currency: "IDR",
  },
  {
    id: "2",
    merchant_name: "Starbucks Coffee",
    total_amount: 280000,
    date: "2024-01-14",
    status: "allocated", // members added, ready to share
    member_count: 4,
    currency: "IDR",
  },
  {
    id: "3",
    merchant_name: "Pizza Hut",
    total_amount: 450000,
    date: "2024-01-13",
    status: "outstanding",
    member_count: 0,
    currency: "IDR",
  },
];

export default function SettlementListPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settlement List</h1>
            <p className="text-muted-foreground">
              Manage your bill settlements and share with friends
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {settlements.map((settlement) => (
            <Card
              key={settlement.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {settlement.merchant_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(settlement.date).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      settlement.status === "allocated"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {settlement.status === "allocated" ? "Allocated" : "Outstanding"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Receipt className="w-4 h-4" />
                      {formatCurrency(settlement.total_amount)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {settlement.member_count} members
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {settlement.status === "allocated" && (
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    )}
                    <Button asChild size="sm">
                      <Link href={`/settlement/${settlement.id}`}>
                        {settlement.status === "outstanding"
                          ? "Add Members"
                          : "View Details"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {settlements.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No settlements yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first bill to start splitting expenses
            </p>
            <Button asChild>
              <Link href="/bill/new">
                <Plus className="w-4 h-4 mr-2" />
                Create First Bill
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
