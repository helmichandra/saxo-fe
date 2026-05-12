import React from "react";

import "./globals.css";

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

        <script
          async
          src="https://embed.tawk.to/676efd3349e2fd8dfeff31fd/1ig4oq54v"
        ></script>
      </head>

      <body>
        {children}
      </body>
    </html>
  );
}