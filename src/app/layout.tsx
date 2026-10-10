import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bello TECH — tecnologia com procedência",
  description:
    "Aparelhos seminovos selecionados, testados e com garantia. Encontre seu próximo iPhone na Bello TECH.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
