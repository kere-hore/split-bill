import { AllocationDetailPage } from "@/widgets/allocation-detail";

interface AllocationDetailPageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: AllocationDetailPageProps) {
  return <AllocationDetailPage groupId={params.id} />;
}