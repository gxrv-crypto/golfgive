import { Logo } from "@/components/shared/logo";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Premium ambient glows */}
      <div className="absolute top-0 left-0 -z-10 size-96 rounded-full bg-primary/10 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 -z-10 size-[450px] rounded-full bg-accent/10 blur-[120px] translate-x-1/3 translate-y-1/3" />
      <div className="absolute inset-0 -z-20 bg-background" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <Logo className="mb-8 hover:scale-102 transition-transform duration-200" />
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
