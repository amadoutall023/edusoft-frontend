export interface FiliereData {
    id: number;
    nom: string;
    code: string;
    description: string;
}

export const filieresData: FiliereData[] = [
    {
        id: 1,
        nom: 'CPD',
        description: 'Formation axée sur la gestion et la coordination de projets numériques',
        code: 'DC3482'
    },
    {
        id: 2,
        nom: 'CDSD',
        description: 'Conception et Développement de Solutions Digitales',
        code: 'DC34182'
    },
    {
        id: 3,
        nom: 'IGS',
        description: 'Ingénierie des Systèmes d\'Information et de Communication',
        code: 'IGS2024'
    },
    {
        id: 4,
        nom: 'MAE',
        description: 'Management et Administration des Entreprises',
        code: 'MAE2023'
    },
    {
        id: 5,
        nom: 'FIN',
        description: 'Finance et Comptabilité appliquée',
        code: 'FIN2024'
    },
];

