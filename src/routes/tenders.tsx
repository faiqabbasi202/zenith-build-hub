import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Action, Container, PageHero, SectionHead } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { submitVendor } from "@/lib/content.functions";
import { longDate } from "@/lib/format";
import { tendersQuery } from "@/lib/queries";

export const Route = createFileRoute("/tenders")({
  loader: ({ context }) => context.queryClient.ensureQueryData(tendersQuery),
  head: () => ({
    meta: [
      { title: "Tenders & Vendor Registration | AMARC" },
      {
        name: "description",
        content:
          "Open procurement tenders at AMARC and vendor registration for material suppliers and subcontractors in Pakistan.",
      },
      { property: "og:title", content: "Tenders & Vendor Registration | AMARC" },
      {
        property: "og:description",
        content: "Bid on AMARC tenders or register as a supplier or subcontractor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TendersPage,
});

const inputCls =
  "w-full rounded-sm border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-amber";

function TendersPage() {
  const { data: tenders } = useSuspenseQuery(tendersQuery);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    try {
      await submitVendor({
        data: {
          company_name: String(form.get("company_name") ?? ""),
          contact_person: String(form.get("contact_person") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          category: String(form.get("category") ?? ""),
          ntn: String(form.get("ntn") ?? ""),
          city: String(form.get("city") ?? ""),
          website: String(form.get("website") ?? ""),
          message: String(form.get("message") ?? ""),
        },
      });
      toast.success("Registration received. Procurement will review it.");
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Could not submit your registration. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Procurement"
        title="Tenders and vendor registration."
        intro="We procure through documented tendering. Suppliers and subcontractors can register below for pre-qualification."
      />

      <section className="bg-background py-20 md:py-28">
        <Container>
          <SectionHead eyebrow="Open tenders" heading="Current opportunities" />
          <div className="mt-12 overflow-x-auto border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface">
                <tr>
                  {["Tender", "Reference", "Category", "Published", "Closes", "Documents"].map((h) => (
                    <th key={h} className="label-mono px-5 py-4 text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tenders.map((t: any) => (
                  <tr key={t.id}>
                    <td className="px-5 py-4 font-medium">{t.title}</td>
                    <td className="label-mono px-5 py-4 text-muted-foreground">{t.reference_no}</td>
                    <td className="px-5 py-4 text-muted-foreground">{t.category}</td>
                    <td className="px-5 py-4 text-muted-foreground">{longDate(t.published_on)}</td>
                    <td className="px-5 py-4 text-amber">{longDate(t.closes_at)}</td>
                    <td className="px-5 py-4">
                      {t.document_url ? (
                        <a href={t.document_url} className="underline underline-offset-4 hover:text-amber">
                          Download
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
                {!tenders.length ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-muted-foreground">
                      No open tenders at the moment. Register below to be notified.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-20 md:py-28">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHead
              eyebrow="Vendors"
              heading="Register as a supplier or subcontractor."
              subheading="Registration is free and puts you on the pre-qualified list for future tenders."
            />
          </div>
          <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
            <input required name="company_name" placeholder="Company name *" className={inputCls} />
            <input name="contact_person" placeholder="Contact person" className={inputCls} />
            <input required name="email" type="email" placeholder="Email *" className={inputCls} />
            <input name="phone" placeholder="Phone" className={inputCls} />
            <input name="category" placeholder="Category (e.g. steel, MEP)" className={inputCls} />
            <input name="ntn" placeholder="NTN" className={inputCls} />
            <input name="city" placeholder="City" className={inputCls} />
            <input name="website" placeholder="Website" className={inputCls} />
            <textarea
              name="message"
              placeholder="Products or trades you offer"
              rows={4}
              className={`${inputCls} sm:col-span-2`}
            />
            <div className="sm:col-span-2">
              <Action type="submit" disabled={sending}>
                {sending ? "Submitting…" : "Register as vendor"}
              </Action>
            </div>
          </form>
        </Container>
      </section>
    </SiteShell>
  );
}
