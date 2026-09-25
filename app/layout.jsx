import "./globals.css";
import { PortfolioProvider } from "../context/PortfolioContext";

export const metadata = {
  title: "Vesta",
  description: "AI-powered investment platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
  <PortfolioProvider>
    {children}
  </PortfolioProvider>
</body>
    </html>
  );
}