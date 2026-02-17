import { GraduationCap, Building2, Book, DoorOpen, Layers } from 'lucide-react';

export interface TabItem {
    id: string;
    label: string;
    icon: any;
}

export const structureTabs: TabItem[] = [
    { id: 'classes', label: 'Classes', icon: GraduationCap },
    { id: 'niveaux', label: 'Niveaux', icon: Layers },
    { id: 'filieres', label: 'Filières', icon: Building2 },
    { id: 'modules', label: 'Modules', icon: Book },
    { id: 'salles', label: 'Salles', icon: DoorOpen },
];

