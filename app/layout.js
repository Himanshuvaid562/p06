import "./globals.css";

export const metadata = { title: "Heard in Class, Lost After" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <a href="/">Home</a> | <a href="/student">Student</a> | <a href="/faculty">Faculty</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
