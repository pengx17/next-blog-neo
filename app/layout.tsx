import {
  Fira_Code,
  Noto_Serif_SC,
  Source_Sans_3,
  Source_Serif_4,
} from "@next/font/google";

import "./global.css";
import { AnalyticsWrapper } from "./components/analytics";

const cx = (...args: string[]) => {
  return args.filter(Boolean).join(" ");
};

const firaCode = Fira_Code({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-fira-code",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
});

const sourceSansPro = Source_Sans_3({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-source-sans-pro",
  style: ["normal", "italic"],
});

const sourceSerifPro = Source_Serif_4({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-source-serif-pro",
  style: ["normal", "italic"],
});

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={cx(
        "antialiased font-sans",
        firaCode.variable,
        notoSerifSC.variable,
        sourceSansPro.variable,
        sourceSerifPro.variable
      )}
    >
      <head />
      <body className="flex flex-col min-h-screen items-center">
        {children}
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
