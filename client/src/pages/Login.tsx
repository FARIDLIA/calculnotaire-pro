import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calculator } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur CalcuNotaire Pro",
        });
      } else {
        await signup(formData.email, formData.password);
        toast({
          title: "Compte créé",
          description: "Votre compte a été créé avec succès",
        });
      }
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CalcuNotaire Pro</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">
              {isLogin ? "Connexion" : "Créer un compte"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isLogin 
                ? "Connectez-vous pour accéder à vos simulations"
                : "Créez un compte pour commencer"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vous@exemple.fr"
                required
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
                data-testid="input-password"
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 8 caractères
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              data-testid="button-submit"
            >
              {loading ? "Chargement..." : (isLogin ? "Se connecter" : "Créer un compte")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
              data-testid="button-toggle-mode"
            >
              {isLogin 
                ? "Pas encore de compte ? Créer un compte"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
