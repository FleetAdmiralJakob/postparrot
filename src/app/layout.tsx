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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "PostParrot",
  description: "A social media platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
          className={`font-sans ${inter.variable} w-full bg-black text-white`}
        >
          <TRPCReactProvider cookies={cookies().toString()}>
            <main className="flex h-screen flex-col items-center">
              <Link
                href="/"
                className="absolute left-3 top-3 flex flex-col items-center sm:left-5 sm:top-5"
              >
                <div className="flex aspect-square h-10 flex-col items-center sm:h-14 md:h-20">
                  <Image
                    src={icon}
                    width={70}
                    height={70}
                    alt="Link to the homepage"
                  />
                </div>
                <h1 className="pt-0.5 text-sm sm:text-base md:text-xl">
                  PostParrot
                </h1>
              </Link>
              {children}
              <Link
                href="https://github.com/FleetAdmiralJakob/postparrot"
                className="absolute bottom-5 left-4 flex items-center gap-2"
              >
                <Github size={42} />
                <div className="hidden md:block">Made with ❤️ by Jakob</div>
              </Link>
            </main>
          </TRPCReactProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
