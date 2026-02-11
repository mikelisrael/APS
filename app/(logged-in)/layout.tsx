"use client";

import MobileNavigation from "@/components/shared/mobile-navigation";
import Sidebar from "@/components/sidebar/";

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div
        id="dashboardContainer"
        className="relative mx-auto grid h-full grid-cols-1 ~px-0/10 sm:max-w-5xl sm:grid-cols-[auto,1fr] lg:max-w-[85rem] lg:grid-cols-[auto,1fr] xl:grid-cols-[250px,1fr]"
      >
        <Sidebar />
        <div className="pb-16 md:pb-0">{children}</div>
      </div>

      <MobileNavigation />
    </>
  );
}
