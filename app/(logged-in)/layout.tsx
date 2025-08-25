import Sidebar from "@/components/sidebar/";

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative mx-auto h-full grid-cols-[auto,1fr] ~px-0/10 sm:grid sm:max-w-3xl lg:max-w-[90rem] lg:grid-cols-[auto,1fr] xl:grid-cols-[250px,1fr]">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}
