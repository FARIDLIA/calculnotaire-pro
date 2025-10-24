import { z } from 'zod';

/**
 * Strict validation schema for simulation inputs
 * Ensures all data is validated before being passed to calc-core
 */
export const simulationInputSchema = z.object({
  // Données générales (NOUVEAU)
  address: z.string().min(5).max(500).optional(),
  inseeCode: z.string().regex(/^\d{5}$/).optional(), // Code INSEE 5 chiffres
  deptCode: z.string().regex(/^\d{2,3}$/).optional(), // 2 ou 3 chiffres (01-95 + DOM-TOM)
  propertyType: z.enum(['appartement', 'maison', 'terrain', 'immeuble', 'local_commercial', 'autre']).optional(),
  
  // Surfaces & DPE (NOUVEAU)
  surfaceHabitable: z.number().min(1).max(10000).optional(), // m² (≥ 1.80m hauteur)
  surfaceAnnexes: z.number().min(0).max(10000).optional(), // m² annexes (cave, garage, etc.)
  dpeLabel: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),

  // Essential
  role: z.enum(['pp', 'sci_ir', 'sci_is']),
  occupation: z.enum(['rp', 'rs', 'first_sale_reinvestment']),
  salePrice: z.number().positive().max(100000000), // Max 100M euros
  purchasePrice: z.number().positive().max(100000000),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date format
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

  // Acquisition
  acquisitionFeesType: z.enum(['flat', 'actual']), // FORFAIT=flat, REEL=actual
  acquisitionFeesAmount: z.number().min(0).max(10000000).optional(),
  worksType: z.enum(['flat', 'actual', 'none']), // Ajout 'none' pour <5 ans
  worksAmount: z.number().min(0).max(10000000).optional(),
  otherAcquisitionCosts: z.number().min(0).max(10000000),

  // Frais de cession & prêt (zone activable - NOUVEAU)
  feesAndLoanEnabled: z.boolean().default(false), // Checkbox "Inclure frais de cession/prêt"
  crd: z.number().min(0).max(10000000).default(0), // Capital restant dû
  iraMode: z.enum(['pct', '6months']).optional(), // Méthode IRA: % ou 6 mois d'intérêts
  iraPct: z.number().min(0).max(10).optional(), // % pénalités si iraMode='pct'
  annualInterestRate: z.number().min(0).max(20).optional(), // Taux annuel pour calcul 6 mois
  releaseFeeCost: z.number().min(0).max(100000).default(0), // Mainlevée
  agencyFees: z.number().min(0).max(5000000).default(0), // Frais agence vendeur
  diagnosticsCosts: z.number().min(0).max(50000).default(0), // Diagnostics
  propertyTaxProration: z.number().min(0).max(100000).default(0), // Prorata taxe foncière
  otherCessionCosts: z.number().min(0).max(1000000).default(0), // Divers

  // SCI IS specific
  vnc: z.number().min(0).max(100000000).optional(),
  cessionFeesDeductible: z.number().min(0).max(1000000).optional(),
  distributedDividends: z.number().min(0).max(100000000).optional(),
  pmeSmeThreshold: z.number().min(0).max(1000000).optional(),

  // Exemption checks
  wasNonOwnerFor4Years: z.boolean().optional(),
  willReinvestIn24Months: z.boolean().optional(),
}).refine(
  (data) => {
    // Purchase date must be before sale date
    return new Date(data.purchaseDate) < new Date(data.saleDate);
  },
  {
    message: "Purchase date must be before sale date",
    path: ["saleDate"],
  }
).refine(
  (data) => {
    // If acquisition fees are actual, amount must be provided
    if (data.acquisitionFeesType === 'actual' && !data.acquisitionFeesAmount) {
      return false;
    }
    return true;
  },
  {
    message: "Acquisition fees amount required when type is 'actual'",
    path: ["acquisitionFeesAmount"],
  }
).refine(
  (data) => {
    // If works are actual, amount must be provided
    if (data.worksType === 'actual' && !data.worksAmount) {
      return false;
    }
    return true;
  },
  {
    message: "Works amount required when type is 'actual'",
    path: ["worksAmount"],
  }
);

export type SimulationInput = z.infer<typeof simulationInputSchema>;
