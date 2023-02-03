import {
  Fira_Code,
  Noto_Serif_SC,
  Source_Sans_Pro,
  Source_Serif_Pro,
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

const sourceSansPro = Source_Sans_Pro({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-source-sans-pro",
  style: ["normal", "italic"],
});

const sourceSerifPro = Source_Serif_Pro({
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
      lang="zh_CN"
      className={cx(
        "antialiased font-sans",
        firaCode.variable,
        notoSerifSC.variable,
        sourceSansPro.variable,
        sourceSerifPro.variable
      )}
    >
      <head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        {/* @ts-expect-error see https://beta.nextjs.org/docs/api-reference/file-conventions/head#supported-head-tags */}
        <link precedence="default" rel="icon" href="/favicon.jpeg" />
        <meta name="description" content="A personal blog by pengx17" />
        <title>pengx17</title>
        <meta
          name="twitter:card"
          content="https://avatars.githubusercontent.com/u/584378"
        />
        <meta
          name="og:image"
          content="https://avatars.githubusercontent.com/u/584378"
        />
      </head>
      <body className="flex flex-col min-h-screen items-center">
        {children}
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
