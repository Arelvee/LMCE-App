'use client'; // Required for usePathname in App Router

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-green-900 text-white shadow-md">
            <div className="flex flex-col items-center justify-start px-4 py-6 space-y-6">
                <Link href="/" className="flex flex-col items-center">
                    <img src="/logo.png" alt="LMCE Logo" className="h-20 mb-2" />
                    <span className="text-2xl font-bold">LMCE-APP</span>
                </Link>

                <nav className="w-full">
                    <ul className="space-y-2">
                        {[
                            { label: 'Home', icon: HomeIcon },
                            { label: 'Lettuce', icon: LettuceIcon },
                            { label: 'Water Tank', icon: TankIcon },
                            { label: 'Mobile Application', icon: MobileIcon },
                            { label: 'Logout', icon: LogoutIcon }
                        ].map(({ label, icon: Icon }) => {
                            const path = getPath(label);
                            const isActive = pathname === path;

                            return (
                                <li key={label}>
                                    <Link
                                        href={path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition duration-200 ${
                                            isActive ? 'bg-green-800' : 'hover:bg-green-800'
                                        }`}
                                    >
                                        <Icon />
                                        <span className="text-sm">{label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}

// Path resolver
function getPath(label) {
    switch (label) {
        case 'Home':
            return '/main/home/overview';
        case 'Lettuce':
            return '/main/lettuce';
        case 'Water Tank':
            return '/main/home/water_tank';
        case 'Mobile Application':
            return '/main/home/mobileapp';
        case 'Logout':
            return '/';
        default:
            return '#';
    }
}

// Icons
const baseIconStyle = "w-5 h-5 text-green-200 group-hover:text-white transition duration-200";

const HomeIcon = () => (
    <svg className={baseIconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M10 12V8.964M14 12V8.964M15 12a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1z" />
        <path d="M8.5 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-2" />
    </svg>
);

const LettuceIcon = () => (
    <svg className={baseIconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22" />
        <path d="M2 22 17 7" />
    </svg>
);

const TankIcon = () => (
    <svg className={baseIconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14a9 3 0 0 0 18 0V5" />
    </svg>
);

const MobileIcon = () => (
    <svg className={baseIconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect width="10" height="14" x="3" y="8" rx="2" />
        <path d="M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4" />
        <path d="M8 18h.01" />
    </svg>
);

const LogoutIcon = () => (
    <svg className={baseIconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
        <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
        <path d="M12 2v4" />
        <path d="m2 2 20 20" />
    </svg>
);
