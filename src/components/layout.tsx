import React from 'react';
import NavigationBar from './navigationBar';

interface LayoutProps {
  children: React.ReactNode;
  showHeader: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showHeader }) => {

  return (
    <div className="flex flex-col h-screen">
      {showHeader && (
        <header className="flex-shrink-0">
          <NavigationBar />
        </header>
      )}
      <main className={"flex-grow overflow-y-auto"}>
        {children}
      </main>
    </div>
  );
};

export default Layout;