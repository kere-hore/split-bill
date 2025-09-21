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
        
        const title = `${member.memberName}'s Bill - ${group.name}`;
        const desc = `${member.memberName}'s share from ${group.bill?.merchantName || group.name}: Rp ${totalAmount}`;
        
        return {
          title: `${title} | Split Bill`,
          description: desc,
          alternates: {
            canonical: currentUrl,
          },
          openGraph: {
            title: title,
            description: desc,
            type: "website",
            url: currentUrl,
            siteName: "Split Bill",
            images: [{
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: `${member.memberName}'s Bill Share`,
            }],
          },
          twitter: {
            card: "summary_large_image",
            title: title,
            description: desc,
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
  
  const title = "Bill Allocation";
  const desc = "View your bill allocation and payment breakdown.";
  
  return {
    title: `${title} - Split Bill`,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      type: "website",
      siteName: "Split Bill",
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: "Bill Allocation",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: desc,
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
