export interface ModuleData {
    id: number;
    nom: string;
    code: string;
    credits?: number;
    filiereId: string;
}

export const modulesData: ModuleData[] = [
    {
        id: 1,
        nom: 'Programmation Web',
        code: 'WEB101',
        credits: 4,
        filiereId: 'INFO'
    },
    {
        id: 2,
        nom: 'Base de données',
        code: 'BDD201',
        credits: 3,
        filiereId: 'INFO'
    },
    {
        id: 3,
        nom: 'Algorithmique',
        code: 'ALGO101',
        credits: 4,
        filiereId: 'INFO'
    },
    {
        id: 4,
        nom: 'Gestion de Projets',
        code: 'GP301',
        credits: 2,
        filiereId: 'GESTION'
    },
    {
        id: 5,
        nom: 'Marketing Digital',
        code: 'MKT201',
        credits: 3,
        filiereId: 'MARKETING'
    },
    {
        id: 6,
        nom: 'Communication',
        code: 'COM101',
        credits: 2,
        filiereId: 'COMM'
    },
];

