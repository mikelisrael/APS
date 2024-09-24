import Extras from "@/components/extras";
import Sidebar from "@/components/sidebar/";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative mx-auto sm:grid h-full grid-cols-[auto,1fr] ~px-0/10 sm:max-w-2xl lg:max-w-7xl lg:grid-cols-[auto,1fr,350px] xl:grid-cols-[250px,1fr,350px]">
      <Sidebar />
      <main className="main-content py-10">{children}</main>
      <Extras />
    </div>
  );
}
