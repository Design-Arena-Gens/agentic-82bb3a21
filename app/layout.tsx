import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biosimilar News Monitor',
  description:
    'Centralized monitoring of biosimilar news from major pharmaceutical press rooms, organized with SOP-ready follow-up guidance.'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <div className="header-content">
              <h1>Biosimilar News Monitor</h1>
              <p>
                Consolidated biosimilar intelligence from leading pharmaceutical press
                rooms, triaged by SOP playbooks for rapid follow-up.
              </p>
            </div>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            <span>&copy; {new Date().getFullYear()} Biosimilar Insight Ops</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
