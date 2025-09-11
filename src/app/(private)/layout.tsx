import type { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { getCurrentUser } from "@/shared/lib/clerk";
import { redirect } from "next/navigation";
import "../globals.css";
import BillFormModal from "@/features/bill/ui/bill-modal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Split Bill",
  description: "Split expenses with friends and groups",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    // Sync user to database for all private pages
    const user = await getCurrentUser();

    // If user sync fails, redirect to sign-in
    if (!user) {
      redirect("/sign-in");
    }
  } catch (error) {
    console.error("User sync failed:", error);
    // Redirect to sign-in on any error
    redirect("/sign-in");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="px-4 lg:px-6 py-4 md:py-6">
              {children}
              <BillFormModal />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
