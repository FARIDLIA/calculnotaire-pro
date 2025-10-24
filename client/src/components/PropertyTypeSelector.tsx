import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Home, Building2, MapPin, Warehouse } from "lucide-react";

interface PropertyTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PropertyTypeSelector({ value, onChange }: PropertyTypeSelectorProps) {
  const propertyTypes = [
    { id: "maison", label: "Maison", icon: Home },
    { id: "appartement", label: "Appartement", icon: Building2 },
    { id: "terrain", label: "Terrain", icon: MapPin },
    { id: "local", label: "Local commercial", icon: Warehouse }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {propertyTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.id;
        
        return (
          <Card
            key={type.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover-elevate active-elevate-2",
              isSelected && "border-2 border-primary bg-primary/5"
            )}
            onClick={() => onChange(type.id)}
            data-testid={`card-property-type-${type.id}`}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={cn(
                "text-sm font-medium",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {type.label}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
