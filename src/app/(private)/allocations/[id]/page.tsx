import { AllocationDetailPage } from "@/widgets/allocation-detail";

interface AllocationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: AllocationDetailPageProps) {
  const { id } = await params;
  return <AllocationDetailPage groupId={id} />;
}