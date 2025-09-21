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
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'https://split-bill-mu.vercel.app';
      const currentUrl = `${baseUrl}/public/bills/${groupId}`;
      const imageUrl = `${baseUrl}/images/illustration/payment.png`;
      
      return {
        title: `${group.name} - ${group.bill.merchantName} | Split Bill`,
        description: `Bill split for ${group.bill.merchantName} - Total: Rp ${totalAmount} among ${memberCount} members`,
        alternates: {
          canonical: currentUrl,
        },
        openGraph: {
          title: `${group.name} - Bill Split`,
          description: `${group.bill.merchantName} • Rp ${totalAmount} • ${memberCount} members`,
          type: "website",
          url: currentUrl,
          images: [{
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${group.name} Bill Split`,
          }],
        },
        twitter: {
          card: "summary_large_image",
          title: `${group.name} - Bill Split`,
          description: `${group.bill.merchantName} • Rp ${totalAmount} • ${memberCount} members`,
          images: [imageUrl],
        },
      };
    }
  } catch (error) {
    console.error('Metadata generation error:', error);
  }
  
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://split-bill-mu.vercel.app';
  const imageUrl = `${baseUrl}/images/illustration/payment.png`;
  
  return {
    title: "Bill Split - Split Bill",
    description: "View shared bill split and payment breakdown.",
    openGraph: {
      title: "Bill Split",
      description: "View shared bill split and payment breakdown.",
      type: "website",
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: "Bill Split",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bill Split",
      description: "View shared bill split and payment breakdown.",
      images: [imageUrl],
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
