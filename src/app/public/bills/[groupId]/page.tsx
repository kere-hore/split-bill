import { PublicBillWidget } from "@/widgets/public-bill";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { groupId } = await params;
  return <PublicBillWidget groupId={groupId} />;
}
