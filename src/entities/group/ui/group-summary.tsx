import { Badge } from "@/shared/components/ui/badge";
import { Calendar, Users } from "lucide-react";
import { Group } from "../model/types";

interface GroupSummaryProps {
  group: Group;
}

export function GroupSummary({ group }: GroupSummaryProps) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Group Summary</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {group.description}
              </p>
            )}
          </div>
          <Badge variant={group.status === "allocated" ? "default" : "secondary"}>
            {group.status === "allocated" ? "Allocated" : "Outstanding"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(group.created_at).toLocaleDateString("id-ID")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{group.member_count} members</span>
          </div>
        </div>
      </div>
    </div>
  );
}