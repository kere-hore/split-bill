import { AllocationMemberPage } from "@/widgets/allocation-member";

interface AllocationMemberPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: AllocationMemberPageProps) {
  const { id } = await params;
  return <AllocationMemberPage groupId={id} />;
}
