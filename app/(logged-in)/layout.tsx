import Sidebar from "@/components/sidebar/";

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      id="dashboardContainer"
      className="relative mx-auto hidden h-full grid-cols-[auto,1fr] ~px-0/10 sm:max-w-5xl md:grid lg:max-w-[85rem] lg:grid-cols-[auto,1fr] xl:grid-cols-[250px,1fr]"
    >
      <Sidebar />
      <div>{children}</div>
    </div>
  );
}
