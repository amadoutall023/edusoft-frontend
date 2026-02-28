'use client';

import EvaluationContent from '@/modules/evaluation/components/EvaluationContent';

export default function ProfEvaluationsPage() {
    // Le composant EvaluationContent détectera automatiquement le rôle professeur
    // et affichera l'interface en mode restreint (consultation + dépôt de notes uniquement)
    return <EvaluationContent />;
}
