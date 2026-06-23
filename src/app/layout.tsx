import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Race Day",
  description: "Sistema Integrado de Gestão Esportiva",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-body-md bg-background text-on-background">
        {children}
      </body>
    </html>
  );
}
