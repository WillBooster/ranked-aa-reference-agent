import type { ReactElement, ReactNode } from 'react';

export const metadata = {
  title: 'AI Growbench Reference Agent',
  description: 'Reference AI agent for AI Growbench',
};

const RootLayout = ({ children }: { children: ReactNode }): ReactElement => (
  <html lang="ja">
    <body>{children}</body>
  </html>
);

export default RootLayout;
