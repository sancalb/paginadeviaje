import { notFound } from "next/navigation";
import { Header, Footer, RevealObserver } from "../../components/shell";
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "en" && locale !== "es") notFound();
  return (
    <html lang={locale}>
      <body>
        <a className="skip" href="#main">
          {locale === "en" ? "Skip to content" : "Saltar al contenido"}
        </a>
        <Header locale={locale} />
        <RevealObserver />
        <main id="main">{children}</main>
        <aside className="credits-link">
          <a href={`/${locale}/photo-credits`}>
            {locale === "en"
              ? "Photography credits & licenses"
              : "Créditos y licencias de fotografías"}
          </a>
        </aside>
        <Footer
          locale={locale}
          whatsappNumber={
            /^\+?[1-9]\d{6,14}$/.test(process.env.WHATSAPP_NUMBER || "")
              ? process.env.WHATSAPP_NUMBER!.replace(/^\+/, "")
              : undefined
          }
        />
      </body>
    </html>
  );
}
