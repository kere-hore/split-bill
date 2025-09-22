import { AllocationMemberPage } from "@/widgets/allocation-member";

interface AllocationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: AllocationDetailPageProps) {
  const { id } = await params;
  return <AllocationMemberPage groupId={id} />;
}
