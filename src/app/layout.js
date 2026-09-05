import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Planora",
  description: "A task manager that does more than store tasks. It schedules them.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen selection:bg-primary/30 relative overflow-x-hidden`}>
        
        <Header />
        
        {/* App body pushed down nicely under the floating header. Adjusted mobile padding. */}
        <main className="container mx-auto px-3 sm:px-6 pt-24 md:pt-32 pb-12 relative max-w-6xl animate-in fade-in duration-500">
          {children}
        </main>
      </body>
    </html>
  );
}
