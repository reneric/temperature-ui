import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Garage Climate",
  description: "Garage temperature and humidity data",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta property="og:title" content="Athlete Leaderboard" />
        <meta property="og:image" content="http://athleteleaderboard.com/images/apple-touch2.png" />
        <link rel="apple-touch-icon" href="http://athleteleaderboard.com/images/apple-touch2.png" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
