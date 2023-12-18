import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Github } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import icon from "~/assets/icon.png";
import { Analytics } from "@vercel/analytics/react";
import Search from "~/app/_components/search";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "PostParrot",
  description: "A social media platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <body
          className={`font-sans ${inter.variable} w-full bg-background text-primary`}
        >
          <TRPCReactProvider cookies={cookies().toString()}>
            <main className="flex h-screen flex-col items-center">
              <header className="relative mb-14 mt-3 flex h-14 w-full justify-center sm:mt-5 sm:h-20 md:h-24">
                <Link
                  href="/"
                  className="absolute left-3 flex h-14 flex-col items-center sm:left-5 sm:h-20 md:h-24"
                >
                  <div className="relative flex aspect-square h-full flex-col items-center">
                    <Image src={icon} fill alt="Link to the homepage" />
                  </div>
                  <h1 className="pt-0.5 text-sm sm:text-base md:text-xl">
                    PostParrot
                  </h1>
                </Link>
                <Search />
              </header>
              {children}
              <div className="absolute bottom-5 left-4 flex items-center gap-2">
                <Link href="https://github.com/FleetAdmiralJakob/postparrot">
                  <Github size={42} />
                </Link>
                <div className="hidden md:block">
                  Made with ❤️ by{" "}
                  <Link href="https://www.roessner.tech" className="underline">
                    Jakob
                  </Link>
                </div>
              </div>
            </main>
          </TRPCReactProvider>
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
