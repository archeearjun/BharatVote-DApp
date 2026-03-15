import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Compass } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import MainContainer from "@/components/MainContainer";

export type DocsAction = {
  label: string;
  to?: string;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export type DocsHeroItem = {
  label: string;
  value: string;
  description?: string;
};

export type DocsFeature = {
  title: string;
  description: string;
};

type DocsLayoutProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  heroActions?: DocsAction[];
  heroAsideTitle?: string;
  heroAsideDescription?: string;
  heroAsideItems?: DocsHeroItem[];
  footerTitle?: string;
  footerDescription?: string;
  footerActions?: DocsAction[];
};

type DocsSectionIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  align?: "left" | "center";
  className?: string;
};

type DocsSplitSectionProps = {
  eyebrow?: string;
  title: string;
  description: string;
  bullets?: DocsFeature[];
  reverse?: boolean;
  action?: DocsAction;
  children?: ReactNode;
  asideTitle: string;
  asideDescription?: string;
  asideItems?: DocsFeature[];
  asideChildren?: ReactNode;
};

const links = [
  { to: "/about", label: "About" },
  { to: "/learn", label: "Key Terms" },
  { to: "/guide/main-election", label: "Main Guide" },
  { to: "/guide/demo-election", label: "Demo Guide" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
];

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "About BharatVote", to: "/about" },
      { label: "Key Terms", to: "/learn" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Workflows",
    links: [
      { label: "Main Election Guide", to: "/guide/main-election" },
      { label: "Demo Election Guide", to: "/guide/demo-election" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    title: "Navigation",
    links: [
      { label: "Landing Page", to: "/" },
      { label: "Create or Join Election", to: "/" },
      { label: "Documentation Home", to: "/about" },
    ],
  },
];

const defaultFooterActions: DocsAction[] = [
  { label: "Open Main Guide", to: "/guide/main-election", variant: "secondary" },
  { label: "Read the FAQ", to: "/faq", variant: "secondary" },
];

function getActionVariantClass(variant: DocsAction["variant"] = "secondary") {
  if (variant === "primary") return "btn-primary";
  if (variant === "ghost") return "btn-ghost";
  return "btn-secondary";
}

function ActionLink({ action, className = "" }: { action: DocsAction; className?: string }) {
  const classes = `${getActionVariantClass(action.variant)} ${className}`.trim();
  const icon = action.href ? <ArrowUpRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />;

  if (action.to) {
    return (
      <Link to={action.to} className={classes}>
        <span>{action.label}</span>
        {icon}
      </Link>
    );
  }

  if (action.href) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noreferrer noopener"
        className={classes}
      >
        <span>{action.label}</span>
        {icon}
      </a>
    );
  }

  return <span className={classes}>{action.label}</span>;
}

function FooterTextLink({ action }: { action: DocsAction }) {
  const baseClassName = "text-sm text-slate-600 transition-colors hover:text-slate-900";

  if (action.to) {
    return (
      <Link to={action.to} className={baseClassName}>
        {action.label}
      </Link>
    );
  }

  if (action.href) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noreferrer noopener"
        className={baseClassName}
      >
        {action.label}
      </a>
    );
  }

  return <span className={baseClassName}>{action.label}</span>;
}

export function DocsSectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: DocsSectionIntroProps) {
  const alignmentClass =
    align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left";

  return (
    <section className={`${alignmentClass} ${className}`.trim()}>
      {eyebrow ? (
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
    </section>
  );
}

export function DocsSplitSection({
  eyebrow,
  title,
  description,
  bullets,
  reverse = false,
  action,
  children,
  asideTitle,
  asideDescription,
  asideItems,
  asideChildren,
}: DocsSplitSectionProps) {
  const contentOrder = reverse ? "xl:order-2" : "";
  const asideOrder = reverse ? "xl:order-1" : "";

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <article className={`card-premium relative overflow-hidden p-6 sm:p-8 ${contentOrder}`.trim()}>
        <div className="absolute inset-x-0 top-0 h-1 bg-slate-900/80" />
        {eyebrow ? (
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {eyebrow}
          </div>
        ) : null}
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>

        {bullets?.length ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {bullets.map((bullet) => (
              <div key={bullet.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-900">{bullet.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{bullet.description}</p>
              </div>
            ))}
          </div>
        ) : null}

        {children ? <div className="mt-6">{children}</div> : null}

        {action ? (
          <div className="mt-6">
            <ActionLink action={action} />
          </div>
        ) : null}
      </article>

      <aside className={`card-premium h-full p-6 sm:p-8 ${asideOrder}`.trim()}>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
          <Compass className="h-5 w-5" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Guided Snapshot
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{asideTitle}</h3>
        {asideDescription ? (
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{asideDescription}</p>
        ) : null}

        {asideChildren ? (
          <div className="mt-6">{asideChildren}</div>
        ) : asideItems?.length ? (
          <div className="mt-6 space-y-3">
            {asideItems.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        ) : null}
      </aside>
    </section>
  );
}

export default function DocsLayout({
  eyebrow = "Docs + Guides",
  title,
  description,
  children,
  heroActions,
  heroAsideTitle = "Quick Snapshot",
  heroAsideDescription = "Use this panel for the key context, audience, and core signals that matter before diving deeper.",
  heroAsideItems,
  footerTitle = "Continue exploring BharatVote",
  footerDescription = "Move between the guides, glossary, FAQ, and blog to understand the product from both operational and technical angles.",
  footerActions = defaultFooterActions,
}: DocsLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-subtle font-sans">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] overflow-hidden">
        <div className="absolute -left-16 top-28 h-72 w-72 rounded-[4rem] border border-white/60 bg-white/30" />
        <div className="absolute right-0 top-16 h-[28rem] w-[58rem] rounded-l-[5rem] bg-white/35" />
        <div className="absolute right-24 top-12 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <MainContainer className="!space-y-4" paddingYClassName="py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-4">
              <NavLink to="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                  BV
                </span>
                <div>
                  <div className="text-lg font-semibold text-slate-900">BharatVote</div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Docs + Guides</div>
                </div>
              </NavLink>

              <Link to="/" className="btn-secondary hidden sm:inline-flex xl:hidden">
                <span>Home</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <nav className="min-w-0 xl:flex-1 xl:px-4">
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </nav>

            <div className="hidden xl:block">
              <Link to="/" className="btn-secondary">
                <span>Back Home</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </MainContainer>
      </header>

      <MainContainer className="space-y-8" paddingYClassName="py-6 sm:py-8 lg:py-10">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start">
          <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
            <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-[linear-gradient(135deg,rgba(241,245,249,0.12),rgba(226,232,240,0.8))] xl:block" />
            <div className="absolute -right-16 top-10 h-64 w-64 rounded-full border border-slate-200/80 bg-slate-100/70 blur-2xl" />
            <div className="relative px-6 py-8 lg:px-10 lg:py-12">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm">
                {eyebrow}
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {description}
              </p>

              {heroActions?.length ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {heroActions.map((action) => (
                    <ActionLink key={`${action.label}-${action.to ?? action.href ?? "static"}`} action={action} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="relative grid gap-3">
            <div className="rounded-[28px] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/15">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                    Structured View
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{heroAsideTitle}</h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{heroAsideDescription}</p>
            </div>

            {heroAsideItems?.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {heroAsideItems.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </aside>
        </section>

        <div className="space-y-8">{children}</div>

        <section className="relative overflow-hidden rounded-[32px] bg-slate-900 px-6 py-8 text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.55)] sm:px-8 sm:py-10">
          <div className="absolute -right-14 -top-10 h-36 w-36 rounded-[2.5rem] border border-white/10" />
          <div className="absolute bottom-0 left-16 h-36 w-36 rounded-full bg-white/5 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                Keep Going
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{footerTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">{footerDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {footerActions.map((action) => (
                <ActionLink
                  key={`${action.label}-${action.to ?? action.href ?? "footer"}`}
                  action={{ ...action, variant: "secondary" }}
                />
              ))}
            </div>
          </div>
        </section>

        <footer className="grid gap-8 border-t border-slate-200/80 pb-10 pt-4 lg:grid-cols-[minmax(0,1.15fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <p className="text-base font-semibold text-slate-900">BharatVote Docs</p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-slate-600">
              Explore the guides, glossary, FAQ, and blog to understand BharatVote from both product and technical angles.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{group.title}</p>
              <div className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <div key={`${group.title}-${link.label}`}>
                    <FooterTextLink action={link} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </footer>
      </MainContainer>
    </div>
  );
}
