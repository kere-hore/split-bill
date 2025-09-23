import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Users } from "lucide-react";
import { PublicMember } from "@/shared/api/contract/public-bills";
import Link from "next/link";

interface PublicBillMembersProps {
  members: PublicMember[];
  paymentReceiverId?: string;
  groupId: string;
}

export function PublicBillMembers({
  members,
  paymentReceiverId,
  groupId,
}: PublicBillMembersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Group Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.user?.image} />
                <AvatarFallback>
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Link href={`/allocation/${groupId}/${member.id}`}>
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  {paymentReceiverId === member.id && (
                    <p className="text-xs text-primary">Payment Receiver</p>
                  )}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
