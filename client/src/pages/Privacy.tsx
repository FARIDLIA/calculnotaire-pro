import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
            <CardTitle className="text-3xl">Politique de Confidentialité</CardTitle>
            <p className="text-sm text-muted-foreground">Conforme au RGPD - Dernière mise à jour : Octobre 2024</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2>1. Responsable du traitement</h2>
            <p>
              CalcuNotaire Pro, responsable du traitement de vos données personnelles, s'engage à protéger 
              votre vie privée conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>

            <h2>2. Données collectées</h2>
            <p>
              Nous collectons et traitons les données suivantes :
            </p>
            
            <h3>2.1. Données de compte</h3>
            <ul>
              <li>Adresse email (obligatoire pour l'authentification)</li>
              <li>Mot de passe (chiffré avec bcrypt)</li>
              <li>Date de création du compte</li>
              <li>Statut d'abonnement Stripe (le cas échéant)</li>
            </ul>

            <h3>2.2. Données de simulation</h3>
            <ul>
              <li>Informations sur les biens immobiliers (prix, dates, localisation)</li>
              <li>Résultats des calculs de plus-value</li>
              <li>Date de création et de modification des simulations</li>
            </ul>

            <h3>2.3. Données techniques</h3>
            <ul>
              <li>Adresse IP (pour la sécurité et les logs d'audit)</li>
              <li>User-Agent du navigateur</li>
              <li>Cookies techniques (session, authentification)</li>
            </ul>

            <h3>2.4. Données de paiement</h3>
            <ul>
              <li>Informations de paiement traitées par <strong>Stripe</strong> (nous ne stockons jamais vos cartes bancaires)</li>
              <li>Historique des transactions</li>
            </ul>

            <h2>3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>Gérer votre compte et votre authentification</li>
              <li>Effectuer les calculs de plus-value et générer les rapports PDF</li>
              <li>Traiter vos paiements via Stripe</li>
              <li>Assurer la sécurité de la plateforme (détection de fraude, logs d'audit)</li>
              <li>Vous envoyer des notifications relatives à votre compte</li>
              <li>Améliorer nos services et analyser les usages</li>
            </ul>

            <h2>4. Base légale du traitement</h2>
            <ul>
              <li><strong>Exécution du contrat</strong> : fourniture du service CalcuNotaire Pro</li>
              <li><strong>Obligation légale</strong> : conservation des données fiscales et comptables</li>
              <li><strong>Intérêt légitime</strong> : sécurité de la plateforme et prévention de la fraude</li>
              <li><strong>Consentement</strong> : cookies non essentiels et communications marketing (opt-in)</li>
            </ul>

            <h2>5. Durée de conservation</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Type de données</th>
                  <th className="border p-2 text-left">Durée de conservation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Compte utilisateur actif</td>
                  <td className="border p-2">Jusqu'à suppression par l'utilisateur</td>
                </tr>
                <tr>
                  <td className="border p-2">Simulations</td>
                  <td className="border p-2">Jusqu'à suppression par l'utilisateur ou du compte</td>
                </tr>
                <tr>
                  <td className="border p-2">Logs d'audit</td>
                  <td className="border p-2">12 mois</td>
                </tr>
                <tr>
                  <td className="border p-2">Données de paiement (Stripe)</td>
                  <td className="border p-2">10 ans (obligation légale comptable)</td>
                </tr>
                <tr>
                  <td className="border p-2">Compte inactif (sans connexion)</td>
                  <td className="border p-2">3 ans puis suppression automatique</td>
                </tr>
              </tbody>
            </table>

            <h2>6. Destinataires des données</h2>
            <p>Vos données peuvent être partagées avec :</p>
            <ul>
              <li><strong>Stripe</strong> : traitement sécurisé des paiements (conforme PCI-DSS)</li>
              <li><strong>Hébergeur</strong> : stockage sécurisé des données (serveurs EU)</li>
              <li><strong>Prestataires techniques</strong> : maintenance et support (sous contrat de confidentialité)</li>
            </ul>
            <p>
              <strong>Nous ne vendons jamais vos données à des tiers.</strong>
            </p>

            <h2>7. Vos droits RGPD</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            
            <h3>7.1. Droit d'accès</h3>
            <p>Obtenez une copie de toutes vos données personnelles.</p>

            <h3>7.2. Droit de rectification</h3>
            <p>Corrigez vos données inexactes ou incomplètes.</p>

            <h3>7.3. Droit à l'effacement ("droit à l'oubli")</h3>
            <p>Supprimez votre compte et toutes vos données depuis les paramètres.</p>

            <h3>7.4. Droit à la portabilité</h3>
            <p>Exportez vos simulations au format CSV.</p>

            <h3>7.5. Droit d'opposition</h3>
            <p>Refusez certains traitements (marketing, profilage).</p>

            <h3>7.6. Droit de limitation</h3>
            <p>Restreignez temporairement le traitement de vos données.</p>

            <h2>8. Sécurité des données</h2>
            <p>Nous mettons en œuvre des mesures de sécurité robustes :</p>
            <ul>
              <li>Chiffrement HTTPS/TLS pour toutes les communications</li>
              <li>Mots de passe chiffrés avec bcrypt (coût 10)</li>
              <li>Sessions sécurisées avec cookies httpOnly et sameSite</li>
              <li>Rate limiting pour prévenir les attaques par force brute</li>
              <li>Logs d'audit pour tracer toutes les actions sensibles</li>
              <li>Backups automatiques quotidiens chiffrés</li>
            </ul>

            <h2>9. Transferts internationaux</h2>
            <p>
              Vos données sont stockées dans l'Union Européenne. En cas de transfert hors UE, 
              nous utilisons les clauses contractuelles types de la Commission Européenne.
            </p>

            <h2>10. Cookies</h2>
            <p>
              Consultez notre <a href="/cookies" className="text-primary hover:underline">Politique Cookies</a> 
              {' '}pour plus de détails sur l'utilisation des cookies.
            </p>

            <h2>11. Modifications de la politique</h2>
            <p>
              Nous pouvons modifier cette politique de confidentialité. Les changements importants vous seront 
              notifiés par email 30 jours avant leur entrée en vigueur.
            </p>

            <h2>12. Contact et réclamations</h2>
            <p>
              Pour exercer vos droits ou poser des questions :<br />
              <strong>Email :</strong> privacy@calcunotaire.pro<br />
              <strong>DPO :</strong> dpo@calcunotaire.pro
            </p>
            <p>
              Vous pouvez également déposer une réclamation auprès de la CNIL :<br />
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.cnil.fr
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
