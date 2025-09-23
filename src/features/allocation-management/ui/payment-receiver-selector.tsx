"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { GroupMember } from "@/entities/group";
import { Check } from "lucide-react";

interface PaymentReceiverSelectorProps {
  members: GroupMember[];
  selectedReceiver: string | null;
  onReceiverSelect: (memberId: string) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function PaymentReceiverSelector({
  members,
  selectedReceiver,
  onReceiverSelect,
  onConfirm,
  isLoading = false,
}: PaymentReceiverSelectorProps) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-sm mb-3 text-blue-900 dark:text-blue-100">
        Select Payment Receiver
      </h3>
      <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
        Choose who will receive payments from other members
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        {members.map((member) => {
          const isSelected = selectedReceiver === member.id;

          return (
            <div
              key={member.id}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
              }`}
              onClick={() => onReceiverSelect(member.id)}
            >
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800">
                  <AvatarImage src={member.user?.image || undefined} />
                  <AvatarFallback className="text-sm font-medium">
                    {member.user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs text-center max-w-[80px] truncate font-medium text-gray-900 dark:text-gray-100">
                {member.user?.name?.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      <Button
        onClick={onConfirm}
        disabled={!selectedReceiver || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        {isLoading ? "Setting..." : "Confirm Payment Receiver"}
      </Button>
    </div>
  );
}
