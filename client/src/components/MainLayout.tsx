/**
 * MainLayout - Layout principal com Header global
 */

import { ReactNode } from 'react';
import Header from './Header';
import { AvisosManager } from './avisos/AvisosManager';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AvisosManager />
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
