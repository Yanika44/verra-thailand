import type { ReactNode } from "react";

export function PageHeader({ title, lead, children }: { title: string; lead?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-[2.75rem] sm:leading-tight">{title}</h1>
      {lead && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{lead}</p>}
      {children}
    </div>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}
