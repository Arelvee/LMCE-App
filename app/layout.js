

import localFont from "next/font/local";
import "../styles/main.sass";
import Head from "next/head"; // Import Head for managing the document head

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Lettuce Monitoring and Crop Yield Estimation",
  description: "Master Thesis Electronics Engineering by Engr. Ralph Laurence Visaya, ECE, ECT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        {/* Add your favicon here */}
        <link rel="icon" href="/app/favicon.ico" sizes="any" />
        {/* Optional: Additional sizes */}
        {/* <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" /> */}
        <link rel="apple-touch-icon" href="/app/apple-touch-icon.png" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
