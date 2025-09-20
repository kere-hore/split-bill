import { SettlementDetailWidget } from "@/widgets/settlement-detail";

interface SettlementDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SettlementDetailPageProps({
  params,
}: SettlementDetailPageProps) {
  const { id } = await params;

  return <SettlementDetailWidget groupId={id} />;
}
