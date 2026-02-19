'use client';

import React, { useState } from 'react';
import Sidebar from '@/shared/components/Sidebar';
import Header from '@/shared/components/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-screen bg-gradient-to-br from-[#5B8DEF] via-[#4A7ACC] to-[#3E6AB8] relative flex">
            <Sidebar activeItem="" />

            {/* Header - positioned fixed on mobile */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-[9998]">
                <Header
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                />
            </div>

            <main className="flex-1 lg:ml-[280px] md:ml-0 pt-[80px] h-full flex flex-col relative">
                {/* Header - absolute on desktop */}
                <div className="hidden lg:block">
                    <Header
                        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        isSidebarOpen={isSidebarOpen}
                    />
                </div>

                <div className="content-scroll m-4 md:m-6 bg-slate-50 rounded-xl md:rounded-[20px] p-4 md:p-8 overflow-x-auto h-full flex-1">
                    {children}
                </div>
            </main>

            <style jsx>{`
                @media (max-width: 1023px) {
                    main {
                        padding-top: 0 !important;
                    }
                    .content-scroll {
                        margin-top: 60px !important;
                    }
                }
            `}</style>
        </div>
    );
}
