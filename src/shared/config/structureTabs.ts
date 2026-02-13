import { GraduationCap, Building2, Book, DoorOpen } from 'lucide-react';

export interface TabItem {
    id: string;
    label: string;
    icon: any;
}

export const structureTabs: TabItem[] = [
    { id: 'classes', label: 'Classes', icon: GraduationCap },
    { id: 'filieres', label: 'Filières', icon: Building2 },
    { id: 'modules', label: 'Modules', icon: Book },
    { id: 'salles', label: 'Salles', icon: DoorOpen },
];

