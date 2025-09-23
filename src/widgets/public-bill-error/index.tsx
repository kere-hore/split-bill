import { Card, CardContent } from "@/shared/components/ui/card";

interface PublicBillErrorProps {
  error?: string;
}

export function PublicBillError({ error }: PublicBillErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            ❌ {error || "Bill not found"}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            This bill link may be invalid or the group doesn&apos;t exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}