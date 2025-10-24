import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, Download, Share2, Zap } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onPurchase: (type: 'oneshot' | 'subscription') => void;
}

export default function PaywallModal({ open, onClose, onPurchase }: PaywallModalProps) {
  const features = [
    "PDF certifié avec QR code et horodatage",
    "Formules détaillées et sources officielles",
    "Export CSV des calculs",
    "Lien de partage sécurisé",
    "Versions barèmes BOFiP et DMTO"
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-paywall">
        <DialogHeader>
          <DialogTitle className="text-2xl">Débloquez votre simulation</DialogTitle>
          <DialogDescription>
            Accédez au PDF certifié et aux exports de votre simulation
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* One-shot */}
          <Card className="p-6 hover-elevate border-2">
            <div className="space-y-4">
              <div>
                <Badge variant="outline" className="mb-3">Paiement unique</Badge>
                <h3 className="text-xl font-semibold mb-2">Simulation unique</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-mono">39€</span>
                  <span className="text-muted-foreground">HT</span>
                </div>
              </div>

              <ul className="space-y-3">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => onPurchase('oneshot')}
                data-testid="button-purchase-oneshot"
              >
                <FileText className="w-4 h-4 mr-2" />
                Débloquer maintenant
              </Button>
            </div>
          </Card>

          {/* Subscription */}
          <Card className="p-6 hover-elevate border-2 border-primary relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
              <Zap className="w-3 h-3 mr-1" />
              Recommandé
            </Badge>
            <div className="space-y-4">
              <div>
                <Badge variant="outline" className="mb-3">Abonnement</Badge>
                <h3 className="text-xl font-semibold mb-2">CalcuNotaire Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-mono">99€</span>
                  <span className="text-muted-foreground">/mois HT</span>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">Simulations illimitées</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Organisation en dossiers</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Exports batch (CSV, PDF)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Support prioritaire</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Marque blanche disponible</span>
                </li>
              </ul>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => onPurchase('subscription')}
                data-testid="button-purchase-subscription"
              >
                <Download className="w-4 h-4 mr-2" />
                S'abonner maintenant
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-xs text-center text-muted-foreground mt-4">
          Paiement sécurisé par Stripe • Annulation à tout moment
        </div>
      </DialogContent>
    </Dialog>
  );
}
