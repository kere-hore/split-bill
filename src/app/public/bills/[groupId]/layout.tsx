import { Metadata } from "next";

interface Props {
  params: Promise<{ groupId: string }>;
}



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId } = await params;
  
  try {
    const { prisma } = await import("@/shared/lib/prisma");
    
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        name: true,
        bill: {
          select: {
            merchantName: true,
            totalAmount: true,
          },
        },
        members: {
          select: { id: true },
        },
      },
    });

    if (group?.bill) {
      const totalAmount = Number(group.bill.totalAmount).toLocaleString();
      const memberCount = group.members.length;
      
      return {
        title: `${group.name} - ${group.bill.merchantName} | Split Bill`,
        description: `Bill split for ${group.bill.merchantName} - Total: Rp ${totalAmount} among ${memberCount} members`,
        openGraph: {
          title: `${group.name} - Bill Split`,
          description: `${group.bill.merchantName} • Rp ${totalAmount} • ${memberCount} members`,
          type: "website",
          images: ["/images/illustration/payment.png"],
        },
        twitter: {
          card: "summary_large_image",
          title: `${group.name} - Bill Split`,
          description: `${group.bill.merchantName} • Rp ${totalAmount} • ${memberCount} members`,
          images: ["/images/illustration/payment.png"],
        },
      };
    }
  } catch (error) {
    console.error('Metadata generation error:', error);
  }
  
  return {
    title: "Bill Split - Split Bill",
    description: "View shared bill split and payment breakdown.",
    openGraph: {
      title: "Bill Split",
      description: "View shared bill split and payment breakdown.",
      type: "website",
      images: ["/images/illustration/payment.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bill Split",
      description: "View shared bill split and payment breakdown.",
      images: ["/images/illustration/payment.png"],
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
