import { PlanningSemaine, SeancePlanning, CreneauHoraire, JourSemaine } from '../types';

// Données de plannings par semaine et par classe
export const planningsSemaine: PlanningSemaine[] = [
    {
        id: 1,
        semaineDebut: '2025-02-17',
        semaineFin: '2025-02-21',
        classe: 'L1-CPD',
        creeLe: '2025-02-15',
        seances: [
            {
                id: 1,
                idPlanning: 1,
                classe: 'L1-CPD',
                cours: 'Algorithmes',
                professeur: 'Baila WANE',
                salle: 'Salle 101',
                jour: 'Lundi',
                heureDebut: '08H',
                heureFin: '10H',
                couleur: 'amber'
            },
            {
                id: 2,
                idPlanning: 1,
                classe: 'L1-CPD',
                cours: 'Algorithmes',
                professeur: 'Baila WANE',
                salle: 'Salle 101',
                jour: 'Lundi',
                heureDebut: '10H',
                heureFin: '12H',
                couleur: 'amber'
            },
            {
                id: 3,
                idPlanning: 1,
                classe: 'L1-CPD',
                cours: 'Photoshop',
                professeur: 'Olivier SAGNA',
                salle: 'Salle 304',
                jour: 'Mercredi',
                heureDebut: '13H',
                heureFin: '15H',
                couleur: 'green'
            },
            {
                id: 4,
                idPlanning: 1,
                classe: 'L1-CPD',
                cours: 'Photoshop',
                professeur: 'Olivier SAGNA',
                salle: 'Salle 304',
                jour: 'Mercredi',
                heureDebut: '15H',
                heureFin: '17H',
                couleur: 'green'
            }
        ]
    },
    {
        id: 2,
        semaineDebut: '2025-02-17',
        semaineFin: '2025-02-21',
        classe: 'L1-GRLS',
        creeLe: '2025-02-15',
        seances: [
            {
                id: 5,
                idPlanning: 2,
                classe: 'L1-GRLS',
                cours: 'Cisco',
                professeur: 'Aly TALL',
                salle: 'Salle 802',
                jour: 'Mardi',
                heureDebut: '10H',
                heureFin: '12H',
                couleur: 'pink'
            }
        ]
    },
    {
        id: 3,
        semaineDebut: '2025-02-17',
        semaineFin: '2025-02-21',
        classe: 'L3-CDSD',
        creeLe: '2025-02-15',
        seances: [
            {
                id: 6,
                idPlanning: 3,
                classe: 'L3-CDSD',
                cours: 'Motion Design',
                professeur: 'Serigne MBAYE',
                salle: 'Salle 507',
                jour: 'Jeudi',
                heureDebut: '08H',
                heureFin: '10H',
                couleur: 'purple'
            },
            {
                id: 7,
                idPlanning: 3,
                classe: 'L3-CDSD',
                cours: 'Motion Design',
                professeur: 'Serigne MBAYE',
                salle: 'Salle 507',
                jour: 'Jeudi',
                heureDebut: '10H',
                heureFin: '12H',
                couleur: 'purple'
            }
        ]
    },
    {
        id: 4,
        semaineDebut: '2025-02-17',
        semaineFin: '2025-02-21',
        classe: 'L2-CDSD',
        creeLe: '2025-02-15',
        seances: [
            {
                id: 8,
                idPlanning: 4,
                classe: 'L2-CDSD',
                cours: 'UI/UX Design',
                professeur: 'Moussa DIOP',
                salle: 'Salle 205',
                jour: 'Vendredi',
                heureDebut: '13H',
                heureFin: '15H',
                couleur: 'blue'
            },
            {
                id: 9,
                idPlanning: 4,
                classe: 'L2-CDSD',
                cours: 'UI/UX Design',
                professeur: 'Moussa DIOP',
                salle: 'Salle 205',
                jour: 'Vendredi',
                heureDebut: '15H',
                heureFin: '17H',
                couleur: 'blue'
            }
        ]
    }
];

export const seances: SeancePlanning[] = planningsSemaine.flatMap(p => p.seances);

export const creneaux: CreneauHoraire[] = ['08H-10H', '10H-12H', '13H-15H', '15H-17H'];

export const creneauxConfig = creneaux.map(creneau => {
    const [debut, fin] = creneau.split('-');
    return {
        id: creneau,
        debut,
        fin,
        label: creneau
    };
});

export const jours: JourSemaine[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const classes = ['Toutes les classes', 'L1-CPD', 'L1-GRLS', 'L2-CPD', 'L2-CDSD', 'L3-CDSD'];

export const modules = ['Tous les modules', 'Algorithmes', 'Cisco', 'Photoshop', 'Motion Design', 'UI/UX Design'];

// Fonction pour générer les semaines disponibles
export function getSemainesDisponibles(): { id: string; label: string; debut: string; fin: string }[] {
    const semaines: { id: string; label: string; debut: string; fin: string }[] = [];
    const aujourdhui = new Date();

    // Générer les 8 prochaines semaines
    for (let i = -2; i < 6; i++) {
        const date = new Date(aujourdhui);
        date.setDate(date.getDate() + (i * 7));

        const jourDebut = date.getDay();
        const joursAPayerDebut = jourDebut === 0 ? 1 : (jourDebut === 0 ? 1 : 8 - jourDebut);
        const debutSemaine = new Date(date);
        debutSemaine.setDate(date.getDate() - jourDebut + 1);

        const finSemaine = new Date(debutSemaine);
        finSemaine.setDate(debutSemaine.getDate() + 4);

        const id = debutSemaine.toISOString().split('T')[0];
        const label = `Semaine du ${debutSemaine.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} au ${finSemaine.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;

        semaines.push({
            id,
            label,
            debut: debutSemaine.toISOString().split('T')[0],
            fin: finSemaine.toISOString().split('T')[0]
        });
    }

    return semaines;
}
