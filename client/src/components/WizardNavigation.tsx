import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calculator } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext?: boolean;
  isLastStep?: boolean;
}

export default function WizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canGoNext = true,
  isLastStep = false
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        data-testid="button-previous"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Précédent
      </Button>

      <div className="text-sm text-muted-foreground">
        Étape {currentStep} sur {totalSteps}
      </div>

      <Button
        onClick={onNext}
        disabled={!canGoNext}
        data-testid="button-next"
      >
        {isLastStep ? (
          <>
            <Calculator className="w-4 h-4 mr-2" />
            Calculer
          </>
        ) : (
          <>
            Suivant
            <ChevronRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
