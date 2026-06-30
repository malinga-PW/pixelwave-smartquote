import "./globals.css";

export const metadata = {
  title: "PixelWave Business OS - Full-Suite Agency Management Hub",
  description: "AI-powered transaction lifecycle platform for digital printing, packaging design, and business automation workflows.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-brand-blue selection:text-white">
        {children}
      </body>
    </html>
  );
}
