import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Github } from "lucide-react";
import Link from "next/link";

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
              {children}
              <Link
                href="https://github.com/FleetAdmiralJakob/postparrot"
                className="absolute bottom-5 left-5"
              >
                <Github size={42} />
              </Link>
            </main>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
