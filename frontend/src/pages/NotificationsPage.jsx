import React from 'react';
import NotificationsPanel from '../components/layout/NotificationsPanel';

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <div className="rounded-[2.25rem] border border-[#efe2cf] bg-[#fffcf8] p-5 shadow-[0_24px_46px_rgba(170,132,87,0.12)] md:p-6">
        <NotificationsPanel />
      </div>
    </div>
  );
}
