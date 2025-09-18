import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { GroupMember } from "../model/types";

interface MembersListProps {
  members: GroupMember[];
}

export function MembersList({ members }: MembersListProps) {
  if (members.length === 0) {
    return (
      <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No members added yet. Add members to start cost allocation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.user.image || undefined} />
              <AvatarFallback>
                {member.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{member.user.name}</p>
              <p className="text-xs text-muted-foreground">{member.user.email}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {member.role}
          </Badge>
        </div>
      ))}
    </div>
  );
}