// app/layout.tsx
import './globals.css';
import { Inter as FontSans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from '@/lib/utils';
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { TailwindIndicator } from "@/components/tailwind-indicator";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Font configuration
const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

// SEO and metadata
export const metadata = {
    title: {
        default: "Honest Meals - Healthy Diet Plans",
        template: "%s | Honest Meals"
    },
    description: "Order customized Indian diet meals for weight loss, muscle gain, and healthy living.",
    keywords: [
        "healthy meals", "diet plans", "Indian food", "weight loss meals",
        "muscle gain diet", "meal delivery", "nutrition", "healthy eating"
    ],
    authors: [{ name: "Honest Meals", url: "https://honestmeals.vercel.app" }],
    creator: "Honest Meals",
    metadataBase: new URL('https://honestmeals.vercel.app'),
    alternates: { canonical: '/' },
    openGraph: {
        title: "Honest Meals - Healthy Diet Plans",
        description: "Order customized Indian diet meals for weight loss, muscle gain, and healthy living.",
        url: "https://honestmeals.vercel.app/",
        siteName: "Honest Meals",
        images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Honest Meals Preview Image" }],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Honest Meals - Healthy Diet Plans",
        description: "Order customized Indian diet meals for weight loss, muscle gain, and healthy living.",
        images: ["/twitter-image.png"],
        creator: "@honestmeals",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    manifest: "https://honestmeals.vercel.app/site.webmanifest",
};

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    // Get current user from Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <html lang="en" suppressHydrationWarning>
        <head />
        <body
            className={cn(
                "min-h-screen bg-background font-sans antialiased",
                fontSans.variable
            )}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={false}
            disableTransitionOnChange
        >
            <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">
                    <main>{children}</main>
                </div>
                <SiteFooter />
            </div>

            <ScrollToTop />
            <TailwindIndicator />
        </ThemeProvider>

        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                className: "toast-custom",
                style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px',
                },
                success: {
                    iconTheme: {
                        primary: 'var(--success)',
                        secondary: 'var(--success-foreground)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--destructive)',
                        secondary: 'var(--destructive-foreground)',
                    },
                },
            }}
        />

        <SpeedInsights />
        </body>
        </html>
    );
}
