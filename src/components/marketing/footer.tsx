import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { APP } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{APP.tagline}</p>
        </div>
        <FooterCol
          title="Platform"
          links={[
            { href: "/how-it-works", label: "How it works" },
            { href: "/pricing", label: "Pricing" },
            { href: "/charities", label: "Charities" },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { href: "/login", label: "Log in" },
            { href: "/signup", label: "Subscribe" },
            { href: "/dashboard", label: "Dashboard" },
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/responsible-play", label: "Responsible play" },
          ]}
        />
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP.name} by {APP.legalName}. Play. Win. Give.
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
