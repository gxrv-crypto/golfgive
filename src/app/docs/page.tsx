import type { Metadata } from "next";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { DocsView } from "@/components/docs/docs-view";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Documentation · GolfGive",
  description:
    "Setup guide, API reference and architecture for the GolfGive platform.",
};

export default async function DocsPage() {
  const user = await getSessionUser();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        <DocsView />
      </main>
      <Footer />
    </div>
  );
}
