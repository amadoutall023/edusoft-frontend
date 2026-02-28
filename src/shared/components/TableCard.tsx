'use client';

import React from 'react';
import { Pencil, Trash2, MoreVertical, Eye } from 'lucide-react';

export interface TableCardField {
    label: string;
    value: string | React.ReactNode;
    highlight?: boolean;
}

interface TableCardProps {
    fields: TableCardField[];
    index: number;
    onEdit?: () => void;
    onDelete?: () => void;
    onDeleteConfirm?: (e: React.MouseEvent) => void;
    onView?: () => void;
    variant?: 'default' | 'classe';
}

export default function TableCard({
    fields,
    index,
    onEdit,
    onDelete,
    onDeleteConfirm,
    onView,
    variant = 'default'
}: TableCardProps) {
    const isClasseVariant = variant === 'classe';

    return (
        <div className={`table-card ${isClasseVariant ? 'classe-card' : ''}`}>
            {isClasseVariant ? (
                // Nouveau design mobile-first pour les classes
                <div className="classe-card-content">
                    <div className="classe-info">
                        <div className="classe-index">{index + 1}</div>
                        <div className="classe-details">
                            {fields.find(f => f.highlight)?.value || fields[0]?.value}
                            {fields.filter(f => !f.highlight).map((field, idx) => (
                                <div key={idx} className="classe-field">
                                    <span className="classe-field-label">{field.label}</span>
                                    <span className="classe-field-value">{field.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bouton flottant à droite */}
                    <div className="classe-actions">
                        <div className="action-menu">
                            <button
                                className="action-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <MoreVertical size={16} />
                            </button>
                            <div className="action-dropdown">
                                {onView && (
                                    <button className="action-btn view" onClick={onView}>
                                        <Eye size={14} />
                                        Voir
                                    </button>
                                )}
                                {onEdit && (
                                    <button className="action-btn edit" onClick={onEdit}>
                                        <Pencil size={14} />
                                        Modifier
                                    </button>
                                )}
                                {onDelete && (
                                    <button className="action-btn delete" onClick={onDeleteConfirm || onDelete}>
                                        <Trash2 size={14} />
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Design par défaut (inchangé)
                <>
                    {/* Index and Title in one row */}
                    <div className="card-header">
                        <div className="card-index">{index + 1}</div>
                        <div className="card-title">
                            {fields.find(f => f.highlight)?.value || fields[0]?.value}
                        </div>
                    </div>

                    {/* Other fields vertically */}
                    <div className="card-fields">
                        {fields.filter(f => !f.highlight).map((field, idx) => (
                            <div key={idx} className="card-field-row">
                                <span className="card-field-label">{field.label}</span>
                                <span className="card-field-value">{field.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    {(onEdit || onDelete) && (
                        <div className="card-actions">
                            {onEdit && (
                                <button className="btn-edit" onClick={onEdit}>
                                    <Pencil size={10} />
                                    Modifier
                                </button>
                            )}
                            {onDelete && (
                                <button className="btn-delete" onClick={onDeleteConfirm || onDelete}>
                                    <Trash2 size={10} />
                                    Supprimer
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}

            <style jsx>{`
                .table-card {
                    background: white;
                    border-radius: 8px;
                    padding: 8px 10px;
                    margin-bottom: 8px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
                    border: 1px solid #e2e8f0;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                }
                
                /* Nouveau design mobile-first pour les classes */
                .classe-card {
                    width: 100%;
                    max-width: 420px;
                    height: 150px;
                    border-radius: 25px;
                    padding: 16px 20px;
                    margin: 0 auto 16px auto;
                    box-shadow: 0 4px 20px rgba(91, 141, 239, 0.15);
                    border: 1px solid rgba(91, 141, 239, 0.1);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    overflow: visible;
                    box-sizing: border-box;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .classe-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #5B8DEF 0%, #4A7ACC 100%);
                }
                
                .classe-card-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 100%;
                    gap: 12px;
                }
                
                .classe-info {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    flex: 1;
                    min-width: 0;
                }
                
                .classe-index {
                    background: linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 100%);
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                
                .classe-details {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    overflow: hidden;
                }
                
                .classe-details > div:first-child {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1a202c;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .classe-field {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 0;
                }
                
                .classe-field-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                
                .classe-field-value {
                    font-size: 12px;
                    font-weight: 600;
                    color: #000000;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    min-width: 0;
                }
                
                /* Bouton flottant rond à droite */
                .classe-actions {
                    flex-shrink: 0;
                    position: relative;
                }
                
                .action-menu {
                    position: relative;
                }
                
                .action-button {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: none;
                    background: linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 100%);
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(91, 141, 239, 0.3);
                    transition: all 0.2s ease;
                }
                
                .action-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(91, 141, 239, 0.4);
                }
                
                .action-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s ease;
                    z-index: 1000;
                    min-width: 140px;
                }
                
                .action-menu:hover .action-dropdown,
                .action-menu:focus-within .action-dropdown {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 10px 14px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    text-align: left;
                    transition: background 0.15s ease;
                }
                
                .action-btn.edit {
                    color: #5B8DEF;
                }
                
                .action-btn.edit:hover {
                    background: #f0f7ff;
                }
                
                .action-btn.view {
                    color: #10b981;
                }
                
                .action-btn.view:hover {
                    background: #ecfdf5;
                }
                
                .action-btn.delete {
                    color: #dc2626;
                }
                
                .action-btn.delete:hover {
                    background: #fef2f2;
                }
                
                /* Design par défaut (inchangé) */
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 6px;
                }
                .card-index {
                    background: linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 100%);
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                .card-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: #000000;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .card-fields {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .card-field-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 2px 0;
                }
                .card-field-label {
                    font-size: 9px;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.2px;
                }
                .card-field-value {
                    font-size: 10px;
                    font-weight: 500;
                    color: #334155;
                    text-align: right;
                }
                .card-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 4px;
                    margin-top: 6px;
                    padding-top: 6px;
                    border-top: 1px solid #f1f5f9;
                }
                .btn-edit, .btn-delete {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 3px;
                    padding: 4px 6px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    font-size: 9px;
                    font-weight: 500;
                }
                .btn-edit {
                    background: #E3F2FD;
                    color: #5B8DEF;
                }
                .btn-delete {
                    background: #FEE2E2;
                    color: #DC2626;
                }
                
                /* Responsive mobile-first */
                @media (max-width: 768px) {
                    .table-card {
                        width: 100%;
                        max-width: 100%;
                        margin-left: 0;
                        margin-right: 0;
                        box-sizing: border-box;
                    }
                    
                    .classe-card {
                        width: 100%;
                        max-width: 100%;
                        margin-left: 0;
                        margin-right: 0;
                        box-sizing: border-box;
                    }
                }
                
                /* Ensure cards never exceed mobile screen width */
                @media (min-width: 421px) {
                    .classe-card {
                        max-width: 420px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                }
                
                @media (min-width: 769px) {
                    .table-card {
                        display: none !important;
                    }
                }
                
                * {
                    box-sizing: border-box;
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
}
