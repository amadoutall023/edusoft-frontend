import { LucideIcon } from 'lucide-react';
import { Calendar, User, QrCode, Bell, FileText } from 'lucide-react';
import { Etudiant, MenuAction } from '../types';
import { StudentResponseDto, ClasseInfoDto } from '@/shared/api/types';

// Helper pour construire le label de la classe
const buildClasseLabel = (classe?: ClasseInfoDto | null) => {
    if (!classe) return null;
    const parts = [
        classe.libelle ?? '',
        classe.niveau?.libelle ? ` - ${classe.niveau.libelle}` : '',
        classe.filiere?.libelle ? ` (${classe.filiere.libelle})` : ''
    ];
    return parts.join('').trim();
};

// Mapper pour convertir StudentResponseDto en Etudiant
export const mapStudentToEtudiant = (student: StudentResponseDto): Etudiant => ({
    id: student.id,
    matricule: student.matricule,
    firstName: student.firstName ?? '',
    lastName: student.lastName ?? '',
    email: student.email ?? '',
    phone: student.phone ?? '',
    dateOfBirth: student.dateOfBirth ?? undefined,
    lieuNaissance: student.lieuNaissance ?? undefined,
    nationalite: student.nationalite ?? undefined,
    address: student.address ?? undefined,
    gender: student.gender ?? undefined,
    classe: buildClasseLabel(student.classe) ?? 'Non assigne',
    classeInfo: student.classe ? {
        id: student.classe.id ?? null,
        libelle: student.classe.libelle ?? null,
        filiere: student.classe.filiere ? {
            id: student.classe.filiere.id ?? '',
            libelle: student.classe.filiere.libelle ?? ''
        } : null,
        niveau: student.classe.niveau ? {
            id: student.classe.niveau.id ?? '',
            libelle: student.classe.niveau.libelle ?? ''
        } : null
    } : undefined,
    anneeInscription: student.anneeInscription ?? undefined,
    qrToken: student.qrToken ?? undefined,
    qrCodeImage: student.qrCodeImage ?? undefined,
    createdAt: student.createdAt ?? undefined,
    updatedAt: student.updatedAt ?? undefined
});

// Donnees par defaut pour l'etudiant (fallback quand API non disponible)
export const etudiantActuel: Etudiant = {
    id: '',
    matricule: '',
    firstName: '',
    lastName: '',
    classe: 'Non assigne',
    presence: 0
};

// Menu des actions pour l'etudiant
export const menuActions: MenuAction[] = [
    {
        id: 'planning',
        titre: 'Planning',
        sousTitre: 'Voir Vos Cours',
        icon: Calendar,
        couleur: 'blue',
        route: '/dashboard/etudiant/planning'
    },
    {
        id: 'absences',
        titre: 'Absences Et Retard',
        sousTitre: 'Historique De Presence',
        icon: User,
        couleur: 'yellow',
        route: '/dashboard/etudiant/absences'
    },
    {
        id: 'scanner',
        titre: 'Scanner De Code QR',
        sousTitre: 'Enregistrer Votre Presence',
        icon: QrCode,
        couleur: 'green',
        route: '/dashboard/etudiant/scanner'
    },
    {
        id: 'notifications',
        titre: 'Notification',
        sousTitre: 'Voir Les Notifications',
        icon: Bell,
        couleur: 'red',
        route: '/dashboard/etudiant/notifications'
    },
    {
        id: 'evaluations',
        titre: 'Mes Evaluations',
        sousTitre: 'Voir Vos Notes',
        icon: FileText,
        couleur: 'purple',
        route: '/dashboard/etudiant/evaluation'
    }
];

/*
 * ANCIENNES DONNEES MOCK - SUPPRIMEES
 * Les donnees sont maintenant chargees depuis le backend via les services API:
 * - fetchMyPresenceStats() pour les statistiques de presence
 * - fetchMyAbsences() pour l'historique des absences
 * - fetchMyCours() pour les cours de l'etudiant
 * - fetchMySessions() pour le planning
 * - fetchMyEvaluations() / fetchMyNotes() pour les evaluations et notes
 * - fetchMyQRCode() pour le code QR personnel
 * 
 * Voir: src/modules/etudiant/services/dashboardService.ts
 */
