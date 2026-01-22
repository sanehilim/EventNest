import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Web3Provider } from "@/components/Web3Provider";
import { Navbar } from "@/components/Navbar";
import { SplashScreen } from "@/components/SplashScreen";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { wagmiConfig } from "@/lib/web3config";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventNest - Decentralized Event Ticketing",
  description: "A Web3 event platform for creating and discovering events with NFT tickets. Pay with any crypto, prevent fraud with blockchain.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.get('wagmi.store')?.value || '';
  
  let initialState;
  try {
    initialState = cookieToInitialState(wagmiConfig, cookieHeader);
  } catch (error) {
    // Handle cookie parse errors gracefully
    initialState = undefined;
  }

  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable} antialiased`}>
        <SplashScreen />
        <Web3Provider initialState={initialState}>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </Web3Provider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}