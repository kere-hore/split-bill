import { Metadata } from "next";

interface Props {
  params: Promise<{ groupId: string; memberId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId, memberId } = await params;

  try {
    const { prisma } = await import("@/shared/lib/prisma");

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        name: true,
        allocationData: true,
        bill: {
          select: {
            merchantName: true,
          },
        },
      },
    });

    if (group?.allocationData) {
      const allocation = JSON.parse(group.allocationData);
      const member = allocation.allocations?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any) => a.memberId === memberId
      );

      if (member) {
        const totalAmount = member.breakdown.total.toLocaleString();
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'https://split-bill-mu.vercel.app';
        const currentUrl = `${baseUrl}/public/allocations/${groupId}/${memberId}`;
        const imageUrl = `${baseUrl}/images/illustration/payment.png`;
        
        return {
          title: `${member.memberName}'s Bill - ${group.name} | Split Bill`,
          description: `${member.memberName}'s share from ${
            group.bill?.merchantName || group.name
          }: Rp ${totalAmount}`,
          alternates: {
            canonical: currentUrl,
          },
          openGraph: {
            title: `${member.memberName}'s Bill Share`,
            description: `${
              group.bill?.merchantName || group.name
            } • Rp ${totalAmount}`,
            type: "website",
            url: currentUrl,
            images: [{
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: `${member.memberName}'s Bill Share`,
            }],
          },
          twitter: {
            card: "summary_large_image",
            title: `${member.memberName}'s Bill Share`,
            description: `${
              group.bill?.merchantName || group.name
            } • Rp ${totalAmount}`,
            images: [imageUrl],
          },
        };
      }
    }
  } catch (error) {
    console.error("Metadata generation error:", error);
  }

  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://split-bill-mu.vercel.app';
  const imageUrl = `${baseUrl}/images/illustration/payment.png`;
  
  return {
    title: "Bill Allocation - Split Bill",
    description: "View your bill allocation and payment breakdown.",
    openGraph: {
      title: "Bill Allocation",
      description: "View your bill allocation and payment breakdown.",
      type: "website",
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: "Bill Allocation",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bill Allocation",
      description: "View your bill allocation and payment breakdown.",
      images: [imageUrl],
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
