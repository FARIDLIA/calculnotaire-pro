import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { X, Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'calcunotaire-cookie-consent';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Afficher la bannière après un délai pour ne pas être intrusif
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: false, // Pas de marketing pour CalcuNotaire
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const dismiss = () => {
    // Fermer temporairement sans enregistrer de préférence
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <Card className="max-w-4xl mx-auto p-6 border-primary/20 shadow-xl bg-background/95 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <Cookie className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg mb-2" data-testid="text-cookie-title">
                Gestion des cookies
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nous utilisons des <strong>cookies essentiels</strong> pour garantir le bon fonctionnement de CalcuNotaire Pro 
                (authentification, sauvegardes locales). 
                Les <strong>cookies analytiques</strong> nous aident à améliorer votre expérience. 
                Nous ne vendons jamais vos données. 
                <Link href="/cookies">
                  <a className="text-primary hover:underline ml-1" data-testid="link-cookie-policy">
                    En savoir plus
                  </a>
                </Link>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button 
                onClick={acceptAll}
                variant="default"
                size="sm"
                data-testid="button-accept-all"
              >
                Tout accepter
              </Button>
              
              <Button 
                onClick={acceptNecessary}
                variant="outline"
                size="sm"
                data-testid="button-accept-necessary"
              >
                Seulement nécessaires
              </Button>
              
              <Link href="/cookies">
                <Button 
                  variant="ghost"
                  size="sm"
                  data-testid="button-customize"
                  as="span"
                >
                  Personnaliser
                </Button>
              </Link>
            </div>
          </div>

          <button
            onClick={dismiss}
            className="flex-shrink-0 p-1 rounded-md hover-elevate active-elevate-2"
            aria-label="Fermer la bannière"
            data-testid="button-close-banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Hook pour vérifier si l'utilisateur a consenti aux analytics
 */
export function useAnalyticsConsent(): boolean {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent) {
      try {
        const parsed = JSON.parse(consent);
        setHasConsent(parsed.analytics === true);
      } catch {
        setHasConsent(false);
      }
    }
  }, []);

  return hasConsent;
}
