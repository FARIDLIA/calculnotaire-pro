import WizardNavigation from '../WizardNavigation';

export default function WizardNavigationExample() {
  return (
    <div className="max-w-4xl">
      <WizardNavigation
        currentStep={3}
        totalSteps={6}
        onPrevious={() => console.log('Previous clicked')}
        onNext={() => console.log('Next clicked')}
        canGoNext={true}
        isLastStep={false}
      />
    </div>
  );
}
