import "./globals.css";

export const metadata = {
  title: "APICosmos | Your Universe of APIs",
  description:
    "Discover, explore, and share APIs with the developer community.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}