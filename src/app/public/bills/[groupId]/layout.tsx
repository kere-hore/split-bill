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
      
      const title = `${group.name} - ${group.bill.merchantName}`;  
      const desc = `Bill split for ${group.bill.merchantName} - Total: Rp ${totalAmount} among ${memberCount} members`;
      
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
            alt: `${group.name} Bill Split`,
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
  } catch (error) {
    console.error('Metadata generation error:', error);
  }
  
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://split-bill-mu.vercel.app';
  const imageUrl = `${baseUrl}/images/illustration/payment.png`;
  
  const title = "Bill Split";
  const desc = "View shared bill split and payment breakdown.";
  
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
        alt: "Bill Split",
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

export default function PublicBillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
