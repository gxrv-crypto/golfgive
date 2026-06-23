import { Navbar } from "@/components/marketing/navbar";
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
    <>
      <Navbar user={user} />
      <div className="relative flex  flex-col items-center justify-center px-4 py-12 overflow-hidden">
        {/* Premium ambient glows */}

        <div className="absolute top-0 left-0 -z-10 size-96 rounded-full  -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 flex flex-col items-center w-full max-w-md">
          {/* <Logo className="mb-8 hover:scale-102 transition-transform duration-200" /> */}
          <div className="w-full">{children}</div>
        </div>
      </div></>
  );
}
