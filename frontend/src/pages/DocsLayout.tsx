import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import MainContainer from "@/components/MainContainer";

type DocsLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const links = [
  { to: "/about", label: "About" },
  { to: "/learn", label: "Key Terms" },
  { to: "/guide/main-election", label: "Main Guide" },
  { to: "/guide/demo-election", label: "Demo Guide" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
];

export default function DocsLayout({ title, description, children }: DocsLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-subtle font-sans">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <MainContainer className="!space-y-4" paddingYClassName="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <NavLink to="/" className="text-lg font-semibold text-slate-900 hover:text-slate-700">
              BharatVote
            </NavLink>
            <nav className="flex flex-wrap gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </MainContainer>
      </header>

      <MainContainer className="space-y-6">
        <section className="card-premium p-6">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">{description}</p>
        </section>
        {children}
      </MainContainer>
    </div>
  );
}

