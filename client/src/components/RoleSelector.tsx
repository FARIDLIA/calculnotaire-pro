import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User, Users, Building } from "lucide-react";

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const roles = [
    { 
      id: "pp", 
      label: "Personne Physique", 
      icon: User,
      description: "Particulier vendant un bien immobilier"
    },
    { 
      id: "sci_ir", 
      label: "SCI IR", 
      icon: Users,
      description: "SCI soumise à l'impôt sur le revenu"
    },
    { 
      id: "sci_is", 
      label: "SCI IS", 
      icon: Building,
      description: "SCI soumise à l'impôt sur les sociétés"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = value === role.id;
        
        return (
          <Card
            key={role.id}
            className={cn(
              "p-6 cursor-pointer transition-all hover-elevate active-elevate-2",
              isSelected && "border-2 border-primary bg-primary/5"
            )}
            onClick={() => onChange(role.id)}
            data-testid={`card-role-${role.id}`}
          >
            <div className="flex flex-col gap-4">
              <div className={cn(
                "w-14 h-14 rounded-lg flex items-center justify-center",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className={cn(
                  "font-semibold mb-1",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {role.label}
                </h3>
                <p className="text-xs text-muted-foreground">{role.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
