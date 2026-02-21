import { JourSemaine } from './types';

export const JOUR_OPTIONS: JourSemaine[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const TIME_SLOTS = [
    { id: '08:00-10:00', debut: '08:00', fin: '10:00', label: '08H-10H' },
    { id: '10:00-12:00', debut: '10:00', fin: '12:00', label: '10H-12H' },
    { id: '13:00-15:00', debut: '13:00', fin: '15:00', label: '13H-15H' },
    { id: '15:00-17:00', debut: '15:00', fin: '17:00', label: '15H-17H' }
] as const;

export const STATUS_COLOR: Record<string, string> = {
    TERMINEE: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    EN_COURS: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    PROGRAMME: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    DEFAULT: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
};
