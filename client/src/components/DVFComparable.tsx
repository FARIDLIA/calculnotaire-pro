import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Calendar, Home } from "lucide-react";

interface DVFComparableProps {
  address: string;
  price: number;
  date: string;
  surface: number;
  propertyType: string;
  distance: number;
  etalabLink: string;
}

export default function DVFComparable({
  address,
  price,
  date,
  surface,
  propertyType,
  distance,
  etalabLink
}: DVFComparableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const pricePerSqm = surface > 0 ? Math.round(price / surface) : 0;

  return (
    <Card className="p-4 hover-elevate" data-testid="card-dvf-comparable">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{address}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {propertyType}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground text-xs block">Prix</span>
            <span className="font-mono font-semibold text-primary">{formatCurrency(price)}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Surface</span>
            <span className="font-medium">{surface} m²</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Prix/m²</span>
            <span className="font-mono font-medium">{formatCurrency(pricePerSqm)}/m²</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Distance</span>
            <span className="font-medium">{distance} km</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{date}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={() => window.open(etalabLink, '_blank')}
            data-testid="button-etalab-link"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Etalab
          </Button>
        </div>
      </div>
    </Card>
  );
}
