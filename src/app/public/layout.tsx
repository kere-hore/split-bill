import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split Bill - Share Your Bills",
  description:
    "View and manage shared bill splits with friends and groups. Track expenses, allocations, and settlements easily.",
  keywords: [
    "split bill",
    "expense sharing",
    "bill allocation",
    "group expenses",
    "payment tracking",
  ],
  authors: [{ name: "Kere Hore" }],
  creator: "Kere Hore",
  publisher: "Kere Hore",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Split Bill",
    title: "Split Bill - Share Your Bills",
    description: "View and manage shared bill splits with friends and groups.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@splitbillapp",
    creator: "@splitbillapp",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
