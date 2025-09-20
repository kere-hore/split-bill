import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Users, UserPlus, Eye, Settings } from "lucide-react";
import Link from "next/link";
import { Group } from "../model/types";

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{group.name}</CardTitle>
          <Badge
            variant={group.status === "allocated" ? "default" : "secondary"}
          >
            {group.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {group.description}
        </p>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4" />
          <span className="text-sm">{group.memberCount} members</span>
        </div>

        <div className="flex gap-2">
          {group.status === "allocated" ? (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href={`/settlement/${group.id}`}>
                  <Eye className="w-4 h-4 mr-1" />
                  View Settlement
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/allocations/${group.id}`}>
                  <Settings className="w-4 h-4 mr-1" />
                  Manage Members
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href={`/allocations/${group.id}`}>
                <UserPlus className="w-4 h-4 mr-1" />
                Add Member
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
