/* eslint-disable @next/next/no-page-custom-font */
import Script from "next/script";

import "./global.css";
import "./prism.css";
import { AnalyticsWrapper } from "./components/analytics";

const siteTitle = "pengx17";

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh_CN" className="antialiased font-sans">
      <head>
        <link rel="icon" href="/favicon.jpeg" />
        <meta name="description" content="A personal blog by pengx17" />
        <title>pengx17</title>
        <meta
          name="twitter:card"
          content="https://avatars.githubusercontent.com/u/584378"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Noto+Serif+SC:wght@600;700&family=Source+Sans+Pro:ital,wght@0,400;0,700;1,400;1,700&family=Source+Serif+Pro:ital,wght@0,400;0,600;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen items-center">
        {children}
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
