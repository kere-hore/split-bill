import { Metadata } from "next";

interface Props {
  params: Promise<{ groupId: string; memberId: string }>;
}

async function getMemberAllocationData(groupId: string, memberId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/allocations/${groupId}/${memberId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching allocation data for meta:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId, memberId } = await params;
  const data = await getMemberAllocationData(groupId, memberId);

  if (!data) {
    return {
      title: "Allocation Not Found - Split Bill",
      description: "The requested allocation could not be found.",
    };
  }

  const { group, member, allocation, bill } = data;
  const totalAmount = allocation.breakdown.total.toLocaleString();
  const itemCount = allocation.items.length;

  return {
    title: `${member.name}'s Bill - ${group.name} | Split Bill`,
    description: `${member.name}'s share from ${bill.merchantName}: Rp ${totalAmount} for ${itemCount} items. View detailed breakdown and payment information.`,
    openGraph: {
      title: `${member.name}'s Bill Share`,
      description: `${bill.merchantName} • Rp ${totalAmount} • ${itemCount} items`,
      type: 'website',
      images: [
        {
          url: `/api/og/member?memberName=${encodeURIComponent(member.name)}&groupName=${encodeURIComponent(group.name)}&merchantName=${encodeURIComponent(bill.merchantName)}&totalAmount=${encodeURIComponent(totalAmount)}&itemCount=${itemCount}`,
          width: 1200,
          height: 630,
          alt: `${member.name}'s Bill Allocation`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${member.name}'s Bill Share`,
      description: `${bill.merchantName} • Rp ${totalAmount} • ${itemCount} items`,
      images: [`/api/og/member?memberName=${encodeURIComponent(member.name)}&groupName=${encodeURIComponent(group.name)}&merchantName=${encodeURIComponent(bill.merchantName)}&totalAmount=${encodeURIComponent(totalAmount)}&itemCount=${itemCount}`],
    },
    other: {
      'member:name': member.name,
      'member:total': totalAmount,
      'member:items': itemCount.toString(),
      'bill:merchant': bill.merchantName,
      'group:name': group.name,
    },
  };
}

export default function MemberAllocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}