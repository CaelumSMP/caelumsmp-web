import type { Metadata } from "next";
import { Rubik_Mono_One, Space_Grotesk } from "next/font/google";
import Version from "@/app/_ui/Version";
import s from "./aurora.module.css";
import "./globals.css";

const display = Rubik_Mono_One({ weight: "400", subsets: ["latin"], variable: "--display" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--body" });

export const metadata: Metadata = {
  title: { default: "CaelumSMP", template: "%s — CaelumSMP" },
  description: "CaelumSMP, a community survival Minecraft server.",
};

// Fonts and colors for every page. The public site chrome (strip, menu, footer) lives in (site)/layout.tsx, so /staff has its own.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div className={`${s.page} ${display.variable} ${body.variable}`} id="top">
          {children}
          <Version />
        </div>
      </body>
    </html>
  );
}
