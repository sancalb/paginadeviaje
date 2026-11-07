import type { Metadata } from "next";
import "./globals.css";
import "./boutique.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://discover.deviaje.mx"),
  title: {
    default: "Discover Mexico by deviaje.mx",
    template: "%s | Discover Mexico",
  },
  description:
    "Personal journeys through Mexico, planned with a Mexican travel agency.",
  icons: { icon: "/media/mark-orange.png" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
