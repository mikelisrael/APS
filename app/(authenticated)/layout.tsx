import Extras from "@/components/extras";
import Sidebar from "@/components/sidebar/";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative mx-auto grid h-full max-w-7xl grid-cols-[250px,1fr,350px] ~px-5/10">
      <Sidebar />
      <main className="main-content py-10">{children}</main>
      <Extras />
    </div>
  );
}
