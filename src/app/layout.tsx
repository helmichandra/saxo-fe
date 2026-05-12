import React from "react";

import "./globals.css";

import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>SaXo Crypto</title>

        <meta
          name="description"
          content="Dev"
        />

        <meta
          httpEquiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
      </head>

      <body>
        {children}

        <Script
          strategy="lazyOnload"
          src="https://embed.tawk.to/676efd3349e2fd8dfeff31fd/1ig4oq54v"
        />
      </body>
    </html>
  );
}