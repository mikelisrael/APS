import Extras from "@/components/extras";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative mx-auto grid h-full max-w-7xl grid-cols-[250px,1fr,250px] divide-x ~px-5/10">
      <Sidebar />
      {children}
      <Extras />
    </div>
  );
}
