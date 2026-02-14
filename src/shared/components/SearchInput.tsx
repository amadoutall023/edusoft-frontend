'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxWidth?: string;
}

export default function SearchInput({
    value,
    onChange,
    placeholder = "Rechercher...",
    maxWidth = "400px"
}: SearchInputProps) {
    return (
        <div style={{
            position: 'relative',
            flex: 1,
            maxWidth: maxWidth
        }}>
            <Search
                size={18}
                color="#9ca3af"
                style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                }}
            />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '12px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    background: 'white',
                    color: '#000000'
                }}
                onFocus={(e: any) => {
                    e.currentTarget.style.borderColor = '#5B8DEF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,141,239,0.1)';
                }}
                onBlur={(e: any) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            />
            <style jsx>{`
                input::placeholder {
                    color: #000000;
                    opacity: 0.6;
                }
            `}</style>
        </div>
    );
}

