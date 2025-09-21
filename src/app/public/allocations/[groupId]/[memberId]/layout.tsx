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
        (a: any) => a.memberId === memberId
      );
      
      if (member) {
        const totalAmount = member.breakdown.total.toLocaleString();
        return {
          title: `${member.memberName}'s Bill - ${group.name} | Split Bill`,
          description: `${member.memberName}'s share from ${group.bill?.merchantName || group.name}: Rp ${totalAmount}`,
          openGraph: {
            title: `${member.memberName}'s Bill Share`,
            description: `${group.bill?.merchantName || group.name} • Rp ${totalAmount}`,
            type: 'website',
            images: ["/images/illustration/payment.png"],
          },
          twitter: {
            card: 'summary_large_image',
            title: `${member.memberName}'s Bill Share`,
            description: `${group.bill?.merchantName || group.name} • Rp ${totalAmount}`,
            images: ["/images/illustration/payment.png"],
          },
        };
      }
    }
  } catch (error) {
    console.error('Metadata generation error:', error);
  }
  
  return {
    title: "Bill Allocation - Split Bill",
    description: "View your bill allocation and payment breakdown.",
    openGraph: {
      title: "Bill Allocation",
      description: "View your bill allocation and payment breakdown.",
      type: 'website',
      images: ["/images/illustration/payment.png"],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Bill Allocation",
      description: "View your bill allocation and payment breakdown.",
      images: ["/images/illustration/payment.png"],
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