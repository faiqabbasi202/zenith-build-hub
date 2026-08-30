import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { siteSettingsQuery } from "@/lib/queries";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { WhatsAppButton } from "./whatsapp-button";

export function SiteShell({ children }: { children: ReactNode }) {
  const { data: settings } = useSuspenseQuery(siteSettingsQuery);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-sm focus:bg-amber focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader phone={settings?.phone} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <WhatsAppButton number={settings?.whatsapp} />
    </div>
  );
}
