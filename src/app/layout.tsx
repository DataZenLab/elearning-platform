import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";

// Use Inter font as per design system
const inter = Inter({ subsets: ["latin", "vietnamese"], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "EduFlow - Nền tảng học trực tuyến hàng đầu",
  description: "Học lập trình, thiết kế, marketing từ các chuyên gia hàng đầu.",
};

/**
 * Layout Gốc (Root): Bao bọc toàn bộ ứng dụng Next.js, chứa các cấu hình Provider toàn cục (Theme, Auth, Query).
 * Nơi khai báo font chữ chuẩn (Inter) và cấu hình thẻ <html>, <body> gốc.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
