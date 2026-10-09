import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { A11yApplier, a11yBootScript } from "@/components/accessibility/a11y-applier";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CekGuard Edu — Kenali • Pahami • Lindungi",
    template: "%s · CekGuard Edu",
  },
  description:
    "Platform pendidikan keamanan digital berbasis AI yang mengubah ancaman digital menjadi pengalaman belajar.",
};

export const viewport: Viewport = {
  themeColor: "#1d5fd8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-theme="light" data-contrast="standard" data-font="normal" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: a11yBootScript }} />
      </head>
      <body className={`${jakarta.variable} antialiased`}>
        <A11yApplier />
        {children}
      </body>
    </html>
  );
}
