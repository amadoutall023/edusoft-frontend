'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Download, Loader2, Trash2, Upload, X } from 'lucide-react';
import {
    CourseSupportFileDto,
    deleteCourseSupport,
    downloadCourseSupport,
    listCourseSupports,
    uploadCourseSupport
} from '../services/courseSupportService';
import { updateCourseSummary } from '../services/coursService';
import { ApiError } from '@/shared/errors/ApiError';

interface CourseSupportModalProps {
    coursId: string;
    coursTitle: string;
    initialSummary?: string | null;
    readOnly?: boolean;
    open: boolean;
    onClose: () => void;
    onSummarySaved?: (summary: string) => void;
}

export default function CourseSupportModal({ coursId, coursTitle, initialSummary, readOnly = false, open, onClose, onSummarySaved }: CourseSupportModalProps) {
    const [supports, setSupports] = useState<CourseSupportFileDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [savingSummary, setSavingSummary] = useState(false);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState<string | null>(null);

    const loadSupports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listCourseSupports(coursId);
            setSupports(data);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Impossible de charger les supports.');
        } finally {
            setLoading(false);
        }
    }, [coursId]);

    useEffect(() => {
        if (open) {
            setSummary(initialSummary ?? '');
            void loadSupports();
        }
    }, [open, initialSummary, loadSupports]);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        setUploading(true);
        setError(null);
        try {
            await uploadCourseSupport(coursId, file);
            await loadSupports();
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Upload impossible. Vérifiez le format/taille du fichier.');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleDelete = async (supportId: string) => {
        try {
            await deleteCourseSupport(coursId, supportId);
            setSupports(prev => prev.filter(s => s.id !== supportId));
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Suppression impossible.');
        }
    };

    const handleSaveSummary = async () => {
        setSavingSummary(true);
        setError(null);
        try {
            await updateCourseSummary(coursId, summary);
            onSummarySaved?.(summary);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Enregistrement du résumé impossible.');
        } finally {
            setSavingSummary(false);
        }
    };

    if (!open) return null;

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'black' }}>Supports de cours</h3>
                        <div style={{ fontSize: '13px', color: 'black' }}>{coursTitle}</div>
                    </div>
                    <button onClick={onClose} style={{ ...closeBtnStyle, color: 'black' }}><X size={18} color="black" /></button>
                </div>

                {!readOnly && (
                    <div style={{ marginBottom: '14px' }}>
                        <label style={uploadLabelStyle}>
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            {uploading ? 'Upload...' : 'Uploader un support'}
                            <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                        </label>
                    </div>
                )}

                <div style={{ marginBottom: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ fontSize: '13px', color: 'black', marginBottom: '8px' }}>Résumé du cours</div>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        disabled={readOnly}
                        rows={4}
                        placeholder="Saisissez le résumé du cours..."
                        style={{
                            width: '100%',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            padding: '10px',
                            fontSize: '14px',
                            resize: 'vertical'
                        }}
                    />
                    {!readOnly && (
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleSaveSummary}
                                disabled={savingSummary}
                                style={{
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: '#059669',
                                    color: 'white',
                                    cursor: savingSummary ? 'not-allowed' : 'pointer',
                                    opacity: savingSummary ? 0.7 : 1
                                }}
                            >
                                {savingSummary ? 'Enregistrement...' : 'Enregistrer le résumé'}
                            </button>
                        </div>
                    )}
                </div>

                {error && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{error}</div>}

                {loading ? (
                    <div style={{ color: 'black', fontSize: '14px' }}>Chargement...</div>
                ) : supports.length === 0 ? (
                    <div style={{ color: 'black', fontSize: '14px' }}>Aucun support uploadé.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {supports.map(support => (
                            <div key={support.id} style={itemStyle}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{support.fileName}</div>
                                    <div style={{ fontSize: '12px', color: 'black' }}>
                                        {(support.fileSize / 1024).toFixed(1)} KB
                                        {support.uploadedByFullName ? ` • ${support.uploadedByFullName}` : ''}
                                    </div>
                                </div>
                                <button
                                    style={iconBtnStyle}
                                    onClick={() => downloadCourseSupport(coursId, support.id, support.fileName, support.cloudinaryUrl)}
                                    title="Télécharger"
                                >
                                    <Download size={16} />
                                </button>
                                {!readOnly && (
                                    <button
                                        style={iconBtnDangerStyle}
                                        onClick={() => handleDelete(support.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

const contentStyle: React.CSSProperties = {
    width: '90%',
    maxWidth: '680px',
    background: 'white',
    borderRadius: '14px',
    padding: '20px',
    maxHeight: '80vh',
    overflowY: 'auto'
};

const closeBtnStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
};

const uploadLabelStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #dbeafe',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px'
};

const itemStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
};

const iconBtnStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    cursor: 'pointer'
};

const iconBtnDangerStyle: React.CSSProperties = {
    ...iconBtnStyle,
    border: '1px solid #fecaca',
    color: '#b91c1c'
};
