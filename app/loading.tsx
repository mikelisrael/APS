import Logo from "@/public/main-logo.svg";

export default function Loading() {
  return (
    <main className="flex h-svh w-full items-center justify-center bg-background">
      <Logo className="size-16 text-primary" />
    </main>
  );
}
