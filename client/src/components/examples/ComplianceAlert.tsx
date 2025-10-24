import ComplianceAlert from '../ComplianceAlert';

export default function ComplianceAlertExample() {
  return (
    <div className="max-w-2xl space-y-4">
      <ComplianceAlert
        type="success"
        title="Exonération validée"
        message="Vous remplissez les conditions pour l'exonération de résidence principale."
      />
      <ComplianceAlert
        type="warning"
        title="Attention aux délais"
        message="Pour bénéficier de l'exonération, le réemploi doit être effectué sous 24 mois."
      />
      <ComplianceAlert
        type="error"
        title="Condition non remplie"
        message="Vous ne pouvez pas bénéficier de l'exonération car vous êtes propriétaire d'une résidence principale."
      />
      <ComplianceAlert
        type="info"
        title="Information DMTO"
        message="Les taux DMTO appliqués sont ceux en vigueur au 01/06/2025 (version v2025-06)."
      />
    </div>
  );
}
