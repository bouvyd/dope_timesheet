import React from 'react';
import NavigationBar from './navigationBar';
import { useMainStore } from '../store/main';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useMainStore();

  return (
    <div className="flex flex-col h-screen">
      {isAuthenticated && (
        <header className="flex-shrink-0">
          <NavigationBar />
        </header>
      )}
      <main className={`flex-grow overflow-y-auto ${isAuthenticated ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;