import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function CGU() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')} 
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Conditions Générales d'Utilisation</CardTitle>
            <p className="text-sm text-muted-foreground">Dernière mise à jour : Octobre 2024</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2>1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme 
              CalcuNotaire Pro, un service en ligne de simulation et de calcul de plus-values immobilières et de frais de notaire.
            </p>

            <h2>2. Acceptation des CGU</h2>
            <p>
              L'utilisation de CalcuNotaire Pro implique l'acceptation pleine et entière des présentes CGU. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>

            <h2>3. Description du service</h2>
            <p>
              CalcuNotaire Pro propose :
            </p>
            <ul>
              <li>Calcul de plus-values immobilières selon les formules officielles BOFiP</li>
              <li>Estimation des droits de mutation (DMTO) par département</li>
              <li>Génération de rapports PDF certifiés avec QR codes</li>
              <li>Export des données en format CSV</li>
              <li>Partage sécurisé de simulations</li>
            </ul>

            <h2>4. Accès au service</h2>
            <p>
              L'accès à CalcuNotaire Pro nécessite la création d'un compte utilisateur. Vous vous engagez à :
            </p>
            <ul>
              <li>Fournir des informations exactes et à jour</li>
              <li>Maintenir la confidentialité de vos identifiants</li>
              <li>Nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
            </ul>

            <h2>5. Tarification</h2>
            <p>
              CalcuNotaire Pro propose :
            </p>
            <ul>
              <li><strong>Calculs ponctuels</strong> : 29-39€ par simulation avec PDF certifié</li>
              <li><strong>Abonnements mensuels</strong> : Accès illimité aux calculs et fonctionnalités premium</li>
            </ul>
            <p>
              Les prix sont indiqués en euros TTC. Les paiements sont traités de manière sécurisée par Stripe.
            </p>

            <h2>6. Propriété intellectuelle</h2>
            <p>
              Tous les contenus présents sur CalcuNotaire Pro (textes, graphiques, logos, icônes, images, logiciels) 
              sont la propriété exclusive de CalcuNotaire Pro et sont protégés par les lois françaises et internationales 
              relatives à la propriété intellectuelle.
            </p>

            <h2>7. Responsabilité et garanties</h2>
            <p>
              <strong>Important :</strong> CalcuNotaire Pro fournit des <strong>simulations indicatives</strong> 
              basées sur les formules officielles du BOFiP. Ces calculs ne sauraient se substituer aux conseils 
              personnalisés d'un professionnel (notaire, avocat fiscaliste, expert-comptable).
            </p>
            <p>
              Nous déclinons toute responsabilité en cas de :
            </p>
            <ul>
              <li>Erreurs dans les données saisies par l'utilisateur</li>
              <li>Modifications réglementaires postérieures à la simulation</li>
              <li>Décisions prises uniquement sur la base de nos simulations</li>
              <li>Interruptions temporaires du service pour maintenance</li>
            </ul>

            <h2>8. Protection des données personnelles</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité 
              de vos données personnelles. Pour plus d'informations, consultez notre{' '}
              <a href="/privacy" className="text-primary hover:underline">Politique de confidentialité</a>.
            </p>

            <h2>9. Résiliation</h2>
            <p>
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil. 
              CalcuNotaire Pro se réserve le droit de suspendre ou de résilier votre accès en cas de violation des présentes CGU.
            </p>

            <h2>10. Modification des CGU</h2>
            <p>
              CalcuNotaire Pro se réserve le droit de modifier les présentes CGU à tout moment. 
              Les utilisateurs seront informés des modifications par email et/ou notification sur la plateforme.
            </p>

            <h2>11. Droit applicable et juridiction</h2>
            <p>
              Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut d'accord amiable, 
              compétence exclusive est attribuée aux tribunaux français.
            </p>

            <h2>12. Contact</h2>
            <p>
              Pour toute question concernant les CGU, contactez-nous à :<br />
              <strong>Email :</strong> contact@calcunotaire.pro<br />
              <strong>Adresse :</strong> CalcuNotaire Pro, France
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
