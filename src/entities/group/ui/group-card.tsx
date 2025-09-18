import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Users, Calendar } from "lucide-react";
import Link from "next/link";
import { Group } from "../model/types";

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(group.created_at).toLocaleDateString("id-ID")}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {group.member_count} members
              </div>
            </div>
            {group.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {group.description}
              </p>
            )}
          </div>
          <Badge 
            variant={group.status === "allocated" ? "default" : "secondary"}
          >
            {group.status === "allocated" ? "Allocated" : "Outstanding"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end gap-2">
          {group.status === "outstanding" ? (
            <Button size="sm" asChild>
              <Link href={`/allocations/${group.id}`}>
                Add Members
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/allocations/${group.id}`}>
                  Manage Members
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/settlements/${group.id}`}>
                  View Settlement
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}