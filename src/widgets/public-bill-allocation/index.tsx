import { ReactNode } from "react";

interface PublicBillAllocationProps {
  children: ReactNode;
}

export function PublicBillAllocation({ children }: PublicBillAllocationProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      {children}
    </div>
  );
}