import { Metadata } from "next";

interface Props {
  params: Promise<{ groupId: string }>;
}

async function getBillData(groupId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/public/bills/${groupId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error("Error fetching bill data for meta:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId } = await params;
  const data = await getBillData(groupId);

  if (!data) {
    return {
      title: "Bill Not Found - Split Bill",
      description: "The requested bill could not be found.",
    };
  }

  const { group, bill, members, allocation } = data;
  const totalAmount = bill.totalAmount.toLocaleString();
  const memberCount = members.length;
  const allocatedAmount =
    allocation?.allocations.reduce(
      (sum: number, a: any) => sum + a.breakdown.total,
      0
    ) || 0;

  return {
    title: `${group.name} - ${bill.merchantName} | Split Bill`,
    description: `Bill split for ${bill.merchantName} (${new Date(
      bill.date
    ).toLocaleDateString(
      "id-ID"
    )}) - Total: Rp ${totalAmount} among ${memberCount} members. ${
      allocatedAmount > 0
        ? `Outstanding: Rp ${allocatedAmount.toLocaleString()}`
        : "Fully settled"
    }`,
    openGraph: {
      title: `${group.name} - Bill Split`,
      description: `${bill.merchantName} • Rp ${totalAmount} • ${memberCount} members`,
      type: "website",
      images: [
        {
          url: `/api/og/bill?groupName=${encodeURIComponent(group.name)}&merchantName=${encodeURIComponent(bill.merchantName)}&totalAmount=${encodeURIComponent(totalAmount)}&memberCount=${memberCount}&date=${encodeURIComponent(new Date(bill.date).toLocaleDateString('id-ID'))}`,
          width: 1200,
          height: 630,
          alt: `${group.name} Bill Split`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${group.name} - Bill Split`,
      description: `${bill.merchantName} • Rp ${totalAmount} • ${memberCount} members`,
      images: [`/api/og/bill?groupName=${encodeURIComponent(group.name)}&merchantName=${encodeURIComponent(bill.merchantName)}&totalAmount=${encodeURIComponent(totalAmount)}&memberCount=${memberCount}&date=${encodeURIComponent(new Date(bill.date).toLocaleDateString('id-ID'))}`],
    },
    other: {
      "bill:merchant": bill.merchantName,
      "bill:total": totalAmount,
      "bill:date": bill.date,
      "group:members": memberCount.toString(),
      "group:status": group.status,
    },
  };
}

export default function PublicBillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
