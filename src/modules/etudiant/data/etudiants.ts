import { Etudiant } from '../types';

export const etudiantsData: Etudiant[] = [
    {
        id: 1,
        matricule: 'ETU2024001',
        firstName: 'Amadou',
        lastName: 'SALL',
        email: 'amadou.sall@ecoleism.sn',
        phone: '+221 77 123 45 67',
        dateOfBirth: '2005-03-15',
        lieuNaissance: 'Dakar',
        nationalite: 'Sénégalaise',
        address: 'Fann, Dakar',
        gender: 'M',
        classe: 'L1-CPD',
        anneeInscription: 2024,
        qrToken: 'QR_ETU2024001_ABC123'
    },
    {
        id: 2,
        matricule: 'ETU2024002',
        firstName: 'Fatou',
        lastName: 'DIOP',
        email: 'fatou.diop@ecoleism.sn',
        phone: '+221 77 234 56 78',
        dateOfBirth: '2004-07-22',
        lieuNaissance: 'Thiès',
        nationalite: 'Sénégalaise',
        address: 'Mermoz, Dakar',
        gender: 'F',
        classe: 'L2-CDSD',
        anneeInscription: 2024,
        qrToken: 'QR_ETU2024002_DEF456'
    },
    {
        id: 3,
        matricule: 'ETU2024003',
        firstName: 'Moussa',
        lastName: 'NDIAYE',
        email: 'moussa.ndiaye@ecoleism.sn',
        phone: '+221 76 345 67 89',
        dateOfBirth: '2006-01-10',
        lieuNaissance: 'Kaolack',
        nationalite: 'Sénégalaise',
        address: 'Sicap Liberté, Dakar',
        gender: 'M',
        classe: 'L1-GRLS',
        anneeInscription: 2024,
        qrToken: 'QR_ETU2024003_GHI789'
    },
    {
        id: 4,
        matricule: 'ETU2024004',
        firstName: 'Mariama',
        lastName: 'SOW',
        email: 'mariama.sow@ecoleism.sn',
        phone: '+221 70 456 78 90',
        dateOfBirth: '2005-11-05',
        lieuNaissance: 'Saint-Louis',
        nationalite: 'Sénégalaise',
        address: 'Point E, Dakar',
        gender: 'F',
        classe: 'L3-CDSD',
        anneeInscription: 2024,
        qrToken: 'QR_ETU2024004_JKL012'
    },
    {
        id: 5,
        matricule: 'ETU2024005',
        firstName: 'Ousmane',
        lastName: 'SENE',
        email: 'ousmane.sene@ecoleism.sn',
        phone: '+221 78 567 89 01',
        dateOfBirth: '2004-05-18',
        lieuNaissance: 'Ziguinchor',
        nationalite: 'Sénégalaise',
        address: 'Ouakam, Dakar',
        gender: 'M',
        classe: 'L2-CPD',
        anneeInscription: 2024,
        qrToken: 'QR_ETU2024005_MNO345'
    }
];

export const classes = ['L1-CPD', 'L1-GRLS', 'L2-CPD', 'L2-CDSD', 'L3-CDSD'];

export const anneesInscription = [2022, 2023, 2024, 2025];

