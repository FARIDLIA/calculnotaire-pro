import WizardProgress from '../WizardProgress';

export default function WizardProgressExample() {
  const steps = [
    { id: 1, label: "Essentiels" },
    { id: 2, label: "Acquisition" },
    { id: 3, label: "Cession" },
    { id: 4, label: "SCI" },
    { id: 5, label: "Surface" },
    { id: 6, label: "Résultats" }
  ];

  return <WizardProgress currentStep={3} steps={steps} />;
}
