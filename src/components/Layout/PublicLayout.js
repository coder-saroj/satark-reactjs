import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../Header/PublicHeader';
import PublicFooter from '../Footer/PublicFooter';

const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicHeader />
      <main className="flex-grow-1 container mt-4">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
