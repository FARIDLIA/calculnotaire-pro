import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface LiveResultsPanelProps {
  grossCapitalGain: number;
  irAllowance: number;
  psAllowance: number;
  irTax: number;
  psTax: number;
  surcharge: number;
  exemptions: string[];
  netProceeds: number;
  salePrice: number;
}

export default function LiveResultsPanel({
  grossCapitalGain,
  irAllowance,
  psAllowance,
  irTax,
  psTax,
  surcharge,
  exemptions,
  netProceeds,
  salePrice
}: LiveResultsPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="p-6 sticky top-4" data-testid="live-results-panel">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Résultat en Direct</h3>
          <p className="text-sm text-muted-foreground">Calcul instantané selon vos données</p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Prix de vente</span>
              <span className="text-sm font-medium">{formatCurrency(salePrice)}</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-md p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Plus-value brute</span>
              <span className="text-xl font-mono font-semibold" data-testid="text-gross-capital-gain">
                {formatCurrency(grossCapitalGain)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Abattement IR ({irAllowance}%)</span>
              <span className="text-xs font-mono">-{formatCurrency(grossCapitalGain * irAllowance / 100)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Abattement PS ({psAllowance}%)</span>
              <span className="text-xs font-mono">-{formatCurrency(grossCapitalGain * psAllowance / 100)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">IR (19%)</span>
              <span className="text-sm font-mono font-medium text-error" data-testid="text-ir-tax">
                {formatCurrency(irTax)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">PS (17,2%)</span>
              <span className="text-sm font-mono font-medium text-error" data-testid="text-ps-tax">
                {formatCurrency(psTax)}
              </span>
            </div>
            {surcharge > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Surtaxe</span>
                <span className="text-sm font-mono font-medium text-error" data-testid="text-surcharge">
                  {formatCurrency(surcharge)}
                </span>
              </div>
            )}
          </div>

          {exemptions.length > 0 && (
            <>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground mb-2 block">Exonérations</span>
                <div className="space-y-1">
                  {exemptions.map((exemption, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-success/10 border-success text-success">
                      {exemption}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="bg-primary/5 border-l-4 border-primary rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Net en poche</span>
              <span className="text-2xl font-mono font-bold text-primary" data-testid="text-net-proceeds">
                {formatCurrency(netProceeds)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Simulation indicative basée sur les données saisies. Ne remplace pas l'avis d'un notaire.</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
