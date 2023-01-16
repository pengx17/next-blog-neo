/* eslint-disable @next/next/no-page-custom-font */
import Script from "next/script";
import { GA_TRACKING_ID } from "../lib/gtag";
import "./global.css";

const siteTitle = "pengx17";
const isProduction = process.env.NODE_ENV === "production";

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
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        {isProduction && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
              }}
            />
          </>
        )}
        <link rel="icon" href="/favicon.jpeg" />
        <meta name="description" content="A personal blog by pengx17" />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
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
      </body>
    </html>
  );
}
