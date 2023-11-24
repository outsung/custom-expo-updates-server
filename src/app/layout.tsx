import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { options } from "@/lib/options";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${options.account}/${options.repository}`,
  description: "Custom Expo Updates Server",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={cn(inter.className, "flex justify-center")}>
        <main className="flex max-w-3xl w-full">{children}</main>
      </body>
    </html>
  );
}
