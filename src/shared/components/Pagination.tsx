'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange
}: PaginationProps) {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div style={{
            padding: '20px 40px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            background: '#fafbfc'
        }}>
            {/* Previous Button */}
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1.5px solid #e5e7eb',
                    background: 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: currentPage === 1 ? 0.5 : 1
                }}
                onMouseEnter={(e: any) => {
                    if (currentPage !== 1) {
                        e.currentTarget.style.borderColor = '#5B8DEF';
                        e.currentTarget.style.background = '#f7fafc';
                    }
                }}
                onMouseLeave={(e: any) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.background = 'white';
                }}
            >
                <ChevronLeft size={18} color="#4a5568" strokeWidth={2.5} />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: `1.5px solid ${currentPage === page ? '#5B8DEF' : '#e5e7eb'}`,
                            background: currentPage === page ? '#5B8DEF' : 'white',
                            color: currentPage === page ? 'white' : '#4a5568',
                            fontSize: '14px',
                            fontWeight: currentPage === page ? '600' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e: any) => {
                            if (currentPage !== page) {
                                e.currentTarget.style.borderColor = '#5B8DEF';
                                e.currentTarget.style.background = '#f7fafc';
                            }
                        }}
                        onMouseLeave={(e: any) => {
                            if (currentPage !== page) {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = 'white';
                            }
                        }}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} style={{ padding: '0 8px', color: '#718096' }}>
                        {page}
                    </span>
                )
            ))}

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1.5px solid #e5e7eb',
                    background: 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    opacity: currentPage === totalPages ? 0.5 : 1
                }}
                onMouseEnter={(e: any) => {
                    if (currentPage !== totalPages) {
                        e.currentTarget.style.borderColor = '#5B8DEF';
                        e.currentTarget.style.background = '#f7fafc';
                    }
                }}
                onMouseLeave={(e: any) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.background = 'white';
                }}
            >
                <ChevronRight size={18} color="#4a5568" strokeWidth={2.5} />
            </button>
        </div>
    );
}

