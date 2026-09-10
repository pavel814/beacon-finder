import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Phone, ShieldCheck, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ReportMissingDialog } from "@/components/report-missing-dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Сообщить о пропавшем — ПСО «Сириус»" },
      {
        name: "description",
        content:
          "Онлайн-заявка о пропавшем человеке в поисково-спасательный отряд «Сириус». Круглосуточная горячая линия +375 (25) 633-28-03.",
      },
      { property: "og:title", content: "Сообщить о пропавшем — ПСО «Сириус»" },
      {
        property: "og:description",
        content: "Заполните заявку о пропавшем человеке — координатор отряда ответит в течение 15 минут.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen bg-surface-dark text-surface-dark-foreground">
      <Toaster />
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-20">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
          <AlertTriangle className="size-4" /> Поисково-спасательный отряд «Сириус»
        </div>

        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Пропал человек?
          <br />
          Сообщите нам прямо сейчас.
        </h1>

        <p className="max-w-xl text-base text-surface-dark-foreground/70">
          Заявка занимает несколько минут. Заполняйте то, что известно — остальное уточнит координатор.
          Помощь отряда бесплатна.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => setOpen(true)}>
            <AlertTriangle className="size-4" /> Сообщить о пропавшем
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href="tel:+375256332803">
              <Phone className="size-4" /> +375 (25) 633-28-03
            </a>
          </Button>
        </div>

        <ul className="grid gap-4 pt-6 sm:grid-cols-3">
          {[
            { icon: Clock, title: "Ответ за 15 минут", text: "Координатор на связи круглосуточно" },
            { icon: ShieldCheck, title: "Конфиденциально", text: "Данные видит только штаб поиска" },
            { icon: Phone, title: "Экстренная линия", text: "Если срочно — просто позвоните" },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl bg-white/5 p-5">
              <Icon className="size-5 text-accent" />
              <p className="mt-3 text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-surface-dark-foreground/60">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <ReportMissingDialog open={open} onOpenChange={setOpen} />
    </main>
  );
}
