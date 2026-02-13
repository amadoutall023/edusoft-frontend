'use client';

import React from 'react';
import { Filter } from 'lucide-react';

interface FilterButtonProps {
    onClick?: () => void;
    label?: string;
}

export default function FilterButton({ onClick, label }: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'white',
                border: '1.5px solid #e5e7eb',
                borderRadius: '12px',
                color: '#4a5568',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
            }}
            onMouseEnter={(e: any) => {
                e.currentTarget.style.borderColor = '#5B8DEF';
                e.currentTarget.style.background = '#f7fafc';
            }}
            onMouseLeave={(e: any) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = 'white';
            }}
        >
            <Filter size={16} strokeWidth={2.5} />
            {label && <span>{label}</span>}
        </button>
    );
}

