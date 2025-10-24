import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Cookies() {
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
            <CardTitle className="text-3xl">Politique Cookies</CardTitle>
            <p className="text-sm text-muted-foreground">Dernière mise à jour : Octobre 2024</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2>1. Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite sur notre site. 
              Les cookies permettent de mémoriser vos préférences et d'améliorer votre expérience utilisateur.
            </p>

            <h2>2. Types de cookies utilisés</h2>
            
            <h3>2.1. Cookies strictement nécessaires (pas de consentement requis)</h3>
            <p>
              Ces cookies sont indispensables au fonctionnement du site :
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Nom</th>
                  <th className="border p-2 text-left">Finalité</th>
                  <th className="border p-2 text-left">Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2"><code>token</code></td>
                  <td className="border p-2">Authentification et session sécurisée</td>
                  <td className="border p-2">7 jours</td>
                </tr>
                <tr>
                  <td className="border p-2"><code>csrf_token</code></td>
                  <td className="border p-2">Protection contre les attaques CSRF</td>
                  <td className="border p-2">Session</td>
                </tr>
              </tbody>
            </table>

            <h3>2.2. Cookies de préférences (consentement requis)</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Nom</th>
                  <th className="border p-2 text-left">Finalité</th>
                  <th className="border p-2 text-left">Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2"><code>theme</code></td>
                  <td className="border p-2">Mémorisation du mode sombre/clair</td>
                  <td className="border p-2">1 an</td>
                </tr>
                <tr>
                  <td className="border p-2"><code>cookie_consent</code></td>
                  <td className="border p-2">Mémorisation de vos choix de cookies</td>
                  <td className="border p-2">1 an</td>
                </tr>
              </tbody>
            </table>

            <h3>2.3. Cookies tiers</h3>
            
            <h4>Stripe (Paiements)</h4>
            <p>
              Stripe utilise des cookies pour traiter les paiements de manière sécurisée. 
              Consultez la <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                politique de confidentialité Stripe
              </a>.
            </p>

            <h2>3. Gestion des cookies</h2>
            
            <h3>3.1. Bannière de consentement</h3>
            <p>
              Lors de votre première visite, une bannière vous permet d'accepter ou de refuser les cookies non essentiels.
            </p>

            <h3>3.2. Paramètres du navigateur</h3>
            <p>
              Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies :
            </p>
            <ul>
              <li>
                <strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies et autres données des sites
              </li>
              <li>
                <strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies et données de sites
              </li>
              <li>
                <strong>Safari :</strong> Préférences → Confidentialité → Gérer les cookies
              </li>
              <li>
                <strong>Edge :</strong> Paramètres → Cookies et autorisations de site → Cookies et données de sites
              </li>
            </ul>

            <h3>3.3. Conséquences du refus des cookies</h3>
            <p>
              Le refus des cookies essentiels empêchera :
            </p>
            <ul>
              <li>La connexion à votre compte</li>
              <li>L'enregistrement de vos simulations</li>
              <li>Le traitement des paiements</li>
            </ul>
            <p>
              Le refus des cookies de préférences entraînera :
            </p>
            <ul>
              <li>La perte de vos préférences de thème</li>
              <li>L'affichage répété de la bannière de cookies</li>
            </ul>

            <h2>4. Durée de conservation</h2>
            <p>
              Les cookies de session sont supprimés à la fermeture du navigateur. 
              Les cookies persistants ont une durée maximale de 13 mois (recommandation CNIL).
            </p>

            <h2>5. Mises à jour de cette politique</h2>
            <p>
              Cette politique peut être modifiée pour refléter les évolutions de nos pratiques ou des exigences légales. 
              La date de dernière mise à jour est indiquée en haut de cette page.
            </p>

            <h2>6. Contact</h2>
            <p>
              Pour toute question concernant les cookies :<br />
              <strong>Email :</strong> privacy@calcunotaire.pro
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
