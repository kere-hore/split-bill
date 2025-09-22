import { AllocationDetailPage } from "@/widgets/allocation-detail";

interface AllocationDetailPageProps {
  params: Promise<{
    groupId: string;
    memberId: string;
  }>;
}
export default async function Page({ params }: AllocationDetailPageProps) {
  const { groupId, memberId } = await params;

  return <AllocationDetailPage groupId={groupId} memberId={memberId} />;
}
