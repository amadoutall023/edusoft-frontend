'use client';

import PlanningFullCalendar from '@/modules/planning/components/PlanningFullCalendar';

export default function ProfPlanningPage() {
    // Le composant PlanningFullCalendar sera en mode lecture seule pour le professeur
    // Le filtrage par professeur se fait côté backend
    return <PlanningFullCalendar />;
}
