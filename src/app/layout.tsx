import "~/styles/globals.css"

import { Inter } from "next/font/google"

import { TRPCReactProvider } from "~/trpc/react"
import Providers from "./_components/client-providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Hot'n'Cheap",
  description: "Created by @rorhug & @_oscarking_",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <Providers>
          <TRPCReactProvider>
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#c58055] to-[#300011] text-white">
              <div className="container flex flex-col items-center justify-center gap-2 px-2 py-16 text-center">
                <h1 className="py-4 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
                  Hot
                  <span className="text-[hsl(0,100%,70%)]">&apos;n&apos;</span>
                  Cheap
                </h1>
                <p className="">Ryanair flights ranked by Summer Magic™️</p>
                <div className="text-xs font-light">
                  Made by{" "}
                  <a
                    className="font-semibold"
                    target="_blank"
                    href="https://twitter.com/_oscarking_"
                  >
                    @_oscarking_
                  </a>{" "}
                  and{" "}
                  <a
                    className="font-semibold"
                    target="_blank"
                    href="https://twitter.com/rorhug"
                  >
                    @rorhug
                  </a>
                  .{" "}
                </div>

                <div className="text-xs font-light">
                  <a
                    className="font-semibold"
                    target="_blank"
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfl_axOPN5Fil8s2CQ2tw9-AM9lNkLMq-CNjXGmlz9DcKvJFg/viewform?usp=sf_link"
                  >
                    Contact us ↗️
                  </a>{" "}
                  <a
                    className="font-semibold"
                    target="_blank"
                    href="https://github.com/rorhug/hotcheap"
                  >
                    GitHub ↗️
                  </a>
                </div>

                <div className="w-full max-w-[700px] md:gap-8">{children}</div>
              </div>
            </main>
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  )
}
