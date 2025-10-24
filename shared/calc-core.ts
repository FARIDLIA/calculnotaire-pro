/**
 * CalcuNotaire Pro - Calculation Engine
 * Pure functions for French real estate capital gains and tax calculations
 * Following BOFiP, DGFiP, and Service-Public official formulas
 */

export interface CapitalGainInput {
  // Données générales (NOUVEAU)
  address?: string;
  inseeCode?: string;
  deptCode?: string;
  propertyType?: 'appartement' | 'maison' | 'terrain' | 'immeuble' | 'local_commercial' | 'autre';
  
  // Surfaces & DPE (NOUVEAU)
  surfaceHabitable?: number;
  surfaceAnnexes?: number;
  dpeLabel?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

  // Essential
  role: 'pp' | 'sci_ir' | 'sci_is';
  occupation: 'rp' | 'rs' | 'first_sale_reinvestment';
  salePrice: number;
  purchasePrice: number;
  purchaseDate: string; // ISO date
  saleDate: string; // ISO date

  // Acquisition
  acquisitionFeesType: 'flat' | 'actual';
  acquisitionFeesAmount?: number; // if actual
  worksType: 'flat' | 'actual' | 'none';
  worksAmount?: number; // if actual
  otherAcquisitionCosts: number;

  // Frais de cession & prêt (zone activable - NOUVEAU)
  feesAndLoanEnabled?: boolean;
  crd?: number; // Capital restant dû
  iraMode?: 'pct' | '6months'; // Méthode IRA
  iraPct?: number; // % pénalités
  annualInterestRate?: number; // Taux annuel pour 6 mois
  releaseFeeCost?: number; // mainlevée
  agencyFees?: number;
  diagnosticsCosts?: number;
  propertyTaxProration?: number;
  otherCessionCosts?: number;

  // SCI IS specific
  vnc?: number; // Valeur nette comptable
  cessionFeesDeductible?: number;
  distributedDividends?: number;
  pmeSmeThreshold?: number; // Default 42500

  // Exemption checks
  wasNonOwnerFor4Years?: boolean;
  willReinvestIn24Months?: boolean;
}

/**
 * Arrondir à 2 décimales (arrondi commercial)
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Payload enrichi structuré selon le prompt (section 2.B)
 */
export interface EnrichedResult {
  general: {
    address?: string;
    insee?: string;
    dept?: string;
    propertyType?: string;
    purchase: { price: number; date: string };
    sale: { price: number; date: string };
    surfaces?: { habitable?: number; annexes?: number; dpe?: string };
  };
  acquisitionBreakdown: {
    purchasePrice: number;
    acqFees: { method: string; percent: number; amount: number };
    works: { method: string; percent: number; amount: number; eligible: boolean };
    other: number;
    basisTotal: number;
  };
  plusValue: {
    pvBrute: number;
    holding: { years: number; months: number };
  };
  abatements: {
    ir: { rate: number; amount: number };
    ps: { rate: number; amount: number };
  };
  taxes: {
    ir: { base: number; amount: number; rate: number };
    ps: { base: number; amount: number; rate: number };
    surtaxe: { amount: number; applied: boolean; tranche: string | null };
    total: number;
  };
  feesAndLoan: {
    enabled: boolean;
    crd: number;
    ira: { mode: string; amount: number; selected: string };
    mainlevee: number;
    agency: number;
    diagnostics: number;
    prorataTf: number;
    misc: number;
    total: number;
  };
  nets: {
    priceNetVendeur: number; // Prix vente - frais vente
    netBeforeLoan: number; // Prix - impôts (sans frais prêt)
    netFinal: number; // Prix - impôts - tous frais prêt
  };
  references: {
    bofip: { url: string; date: string };
    servicePublic: { url: string; date: string };
    impotsGouv: { url: string; date: string };
    dmto: { dept: string; version: string; sourceUrl: string };
    dvf: { available: boolean; count: number };
  };
  meta: {
    tz: string;
    generatedAtLocal: string;
    generatedAtUTC: string;
    rounding: string;
  };
}

// ANCIEN FORMAT (à garder pour compatibilité temporaire)
export interface CapitalGainResult {
  // Acquisition base
  acquisitionBase: number;
  acquisitionFeesUsed: number;
  worksUsed: number;

  // Capital gain
  grossCapitalGain: number;
  holdingYears: number;

  // Tax allowances (PP/SCI IR)
  irAllowancePercent: number;
  psAllowancePercent: number;
  irTaxableBase: number;
  psTaxableBase: number;

  // Taxes
  irTax: number; // 19%
  psTax: number; // 17.2%
  surcharge: number;
  surchangeTranche?: string;

  // SCI IS
  sciIsResult?: number;
  sciIsTax?: number;
  sciPfuTax?: number;

  // Exemptions
  isRpExempt: boolean;
  isFirstSaleExempt: boolean;
  exemptionReasons: string[];

  // IRA
  ira: number;

  // Net proceeds
  totalTax: number;
  netProceeds: number;

  // Metadata
  calculationDate: string;
}

/**
 * Calculate years of ownership (full years only)
 */
export function calculateHoldingYears(purchaseDate: string, saleDate: string): number {
  const purchase = new Date(purchaseDate);
  const sale = new Date(saleDate);
  
  const years = sale.getFullYear() - purchase.getFullYear();
  const monthDiff = sale.getMonth() - purchase.getMonth();
  const dayDiff = sale.getDate() - purchase.getDate();
  
  // Only count full years
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return Math.max(0, years - 1);
  }
  
  return Math.max(0, years);
}

/**
 * Calculate holding period in years AND months (for display)
 * Returns { years, months }
 */
export function calculateHoldingPeriod(purchaseDate: string, saleDate: string): { years: number; months: number } {
  const purchase = new Date(purchaseDate);
  const sale = new Date(saleDate);
  
  let years = sale.getFullYear() - purchase.getFullYear();
  let months = sale.getMonth() - purchase.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Adjust for day of month
  if (sale.getDate() < purchase.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  
  return { years: Math.max(0, years), months: Math.max(0, months) };
}

/**
 * Calculate IRA (Indemnité de Remboursement Anticipé)
 * Deux méthodes : % ou 6 mois d'intérêts, on prend le min
 */
export function calculateIRA(input: {
  crd: number;
  iraMode?: 'pct' | '6months';
  iraPct?: number;
  annualInterestRate?: number;
}): { amount: number; mode: string; selected: 'min' | 'pct' | '6months' } {
  const { crd, iraMode, iraPct, annualInterestRate } = input;
  
  if (!iraMode || crd <= 0) {
    return { amount: 0, mode: 'none', selected: 'min' };
  }
  
  // Méthode %
  const iraPctAmount = iraMode === 'pct' && iraPct ? (crd * iraPct) / 100 : 0;
  
  // Méthode 6 mois d'intérêts
  const ira6MonthsAmount = iraMode === '6months' && annualInterestRate 
    ? (crd * annualInterestRate / 100 * 6) / 12 
    : 0;
  
  // Sélectionner le minimum (règle bancaire)
  if (iraMode === 'pct') {
    return { amount: iraPctAmount, mode: `${iraPct}%`, selected: 'pct' };
  } else if (iraMode === '6months') {
    return { amount: ira6MonthsAmount, mode: '6 mois intérêts', selected: '6months' };
  }
  
  // Par défaut, prendre le min des deux
  const minAmount = Math.min(iraPctAmount, ira6MonthsAmount);
  const selected = minAmount === iraPctAmount ? 'pct' : '6months';
  return { amount: minAmount, mode: 'min', selected };
}

/**
 * Calculate IR tax allowance based on holding period
 * Exempt at 22 years
 */
export function calculateIRAllowance(years: number): number {
  if (years >= 22) return 100;
  if (years < 6) return 0;
  
  // 6% per year from 6 to 21 years
  if (years >= 6 && years <= 21) {
    return 6 * (years - 5);
  }
  
  return 0;
}

/**
 * Calculate PS (social charges) allowance based on holding period
 * Exempt at 30 years
 */
export function calculatePSAllowance(years: number): number {
  if (years >= 30) return 100;
  if (years < 6) return 0;
  
  // 1.65% per year from 6 to 21 years
  if (years >= 6 && years <= 21) {
    return 1.65 * (years - 5);
  }
  
  // 1.60% for year 22
  if (years === 22) {
    return 1.65 * 16 + 1.60;
  }
  
  // 9% per year from 23 to 30 years
  if (years >= 23 && years <= 30) {
    const base22 = 1.65 * 16 + 1.60;
    return base22 + 9 * (years - 22);
  }
  
  return 0;
}

/**
 * Calculate BOFiP surcharge with exact tranches and decay formulas
 * Annexe A implementation
 */
export function calculateSurcharge(pvNetteTaxable: number): { amount: number; tranche: string } {
  if (pvNetteTaxable <= 50000) {
    return { amount: 0, tranche: 'Aucune' };
  }
  
  // Tranche 50,001 - 60,000: 2% - decay
  if (pvNetteTaxable >= 50001 && pvNetteTaxable <= 60000) {
    const decay = (60000 - pvNetteTaxable) * (1 / 20);
    const amount = 0.02 * pvNetteTaxable - decay;
    return { amount: Math.max(0, amount), tranche: '50k-60k (2% avec décote)' };
  }
  
  // Tranche 60,001 - 100,000: 2%
  if (pvNetteTaxable >= 60001 && pvNetteTaxable <= 100000) {
    return { amount: 0.02 * pvNetteTaxable, tranche: '60k-100k (2%)' };
  }
  
  // Tranche 100,001 - 110,000: 3% - decay
  if (pvNetteTaxable >= 100001 && pvNetteTaxable <= 110000) {
    const decay = (110000 - pvNetteTaxable) * (1 / 10);
    const amount = 0.03 * pvNetteTaxable - decay;
    return { amount: Math.max(0, amount), tranche: '100k-110k (3% avec décote)' };
  }
  
  // Tranche 110,001 - 150,000: 3%
  if (pvNetteTaxable >= 110001 && pvNetteTaxable <= 150000) {
    return { amount: 0.03 * pvNetteTaxable, tranche: '110k-150k (3%)' };
  }
  
  // Tranche 150,001 - 160,000: 4% - decay
  if (pvNetteTaxable >= 150001 && pvNetteTaxable <= 160000) {
    const decay = (160000 - pvNetteTaxable) * (15 / 100);
    const amount = 0.04 * pvNetteTaxable - decay;
    return { amount: Math.max(0, amount), tranche: '150k-160k (4% avec décote)' };
  }
  
  // Tranche 160,001 - 200,000: 4%
  if (pvNetteTaxable >= 160001 && pvNetteTaxable <= 200000) {
    return { amount: 0.04 * pvNetteTaxable, tranche: '160k-200k (4%)' };
  }
  
  // Tranche 200,001 - 210,000: 5% - decay
  if (pvNetteTaxable >= 200001 && pvNetteTaxable <= 210000) {
    const decay = (210000 - pvNetteTaxable) * (20 / 100);
    const amount = 0.05 * pvNetteTaxable - decay;
    return { amount: Math.max(0, amount), tranche: '200k-210k (5% avec décote)' };
  }
  
  // Tranche 210,001 - 250,000: 5%
  if (pvNetteTaxable >= 210001 && pvNetteTaxable <= 250000) {
    return { amount: 0.05 * pvNetteTaxable, tranche: '210k-250k (5%)' };
  }
  
  // Tranche 250,001 - 260,000: 6% - decay
  if (pvNetteTaxable >= 250001 && pvNetteTaxable <= 260000) {
    const decay = (260000 - pvNetteTaxable) * (25 / 100);
    const amount = 0.06 * pvNetteTaxable - decay;
    return { amount: Math.max(0, amount), tranche: '250k-260k (6% avec décote)' };
  }
  
  // > 260,000: 6%
  if (pvNetteTaxable > 260000) {
    return { amount: 0.06 * pvNetteTaxable, tranche: '>260k (6%)' };
  }
  
  return { amount: 0, tranche: 'Aucune' };
}

// Ancienne fonction calculateIRA supprimée - remplacée par la nouvelle version avec iraMode ci-dessus

/**
 * Main calculation function
 */
export function calculateCapitalGain(input: CapitalGainInput): CapitalGainResult {
  // Calculate acquisition base
  let acquisitionFeesUsed = 0;
  if (input.acquisitionFeesType === 'flat') {
    acquisitionFeesUsed = input.purchasePrice * 0.075;
  } else if (input.acquisitionFeesAmount !== undefined) {
    acquisitionFeesUsed = input.acquisitionFeesAmount;
  }
  
  const holdingYears = calculateHoldingYears(input.purchaseDate, input.saleDate);
  
  let worksUsed = 0;
  if (input.worksType === 'flat' && holdingYears >= 5) {
    worksUsed = input.purchasePrice * 0.15;
  } else if (input.worksAmount !== undefined) {
    worksUsed = input.worksAmount;
  }
  
  const acquisitionBase = 
    input.purchasePrice + 
    acquisitionFeesUsed + 
    worksUsed + 
    input.otherAcquisitionCosts;
  
  const grossCapitalGain = input.salePrice - acquisitionBase;
  
  // Check exemptions
  const isRpExempt = input.occupation === 'rp';
  const isFirstSaleExempt = 
    input.occupation === 'first_sale_reinvestment' &&
    input.wasNonOwnerFor4Years === true &&
    input.willReinvestIn24Months === true;
  
  const exemptionReasons: string[] = [];
  if (isRpExempt) {
    exemptionReasons.push('Résidence principale');
  }
  if (isFirstSaleExempt) {
    exemptionReasons.push('1ère vente avec réemploi sous 24 mois');
  }
  
  // If exempt, no tax
  if (isRpExempt || isFirstSaleExempt) {
    const iraCalc = calculateIRA({
      crd: input.crd || 0,
      iraMode: input.iraMode,
      iraPct: input.iraPct,
      annualInterestRate: input.annualInterestRate
    });
    const ira = iraCalc.amount;
    const netProceeds = input.salePrice - (input.crd || 0) - ira - (input.releaseFeeCost || 0) -
      (input.agencyFees || 0) - (input.diagnosticsCosts || 0) - (input.propertyTaxProration || 0) - (input.otherCessionCosts || 0);
    
    return {
      acquisitionBase,
      acquisitionFeesUsed,
      worksUsed,
      grossCapitalGain,
      holdingYears,
      irAllowancePercent: 100,
      psAllowancePercent: 100,
      irTaxableBase: 0,
      psTaxableBase: 0,
      irTax: 0,
      psTax: 0,
      surcharge: 0,
      isRpExempt,
      isFirstSaleExempt,
      exemptionReasons,
      ira,
      totalTax: 0,
      netProceeds,
      calculationDate: new Date().toISOString()
    };
  }
  
  // PP / SCI IR calculation
  if (input.role === 'pp' || input.role === 'sci_ir') {
    const irAllowancePercent = calculateIRAllowance(holdingYears);
    const psAllowancePercent = calculatePSAllowance(holdingYears);
    
    const irTaxableBase = grossCapitalGain * (1 - irAllowancePercent / 100);
    const psTaxableBase = grossCapitalGain * (1 - psAllowancePercent / 100);
    
    const irTax = irTaxableBase * 0.19;
    const psTax = psTaxableBase * 0.172;
    
    const surchargeCalc = calculateSurcharge(irTaxableBase);
    
    const totalTax = irTax + psTax + surchargeCalc.amount;
    const iraCalc = calculateIRA({
      crd: input.crd || 0,
      iraMode: input.iraMode,
      iraPct: input.iraPct,
      annualInterestRate: input.annualInterestRate
    });
    const ira = iraCalc.amount;
    
    const netProceeds = input.salePrice - totalTax - (input.crd || 0) - ira - (input.releaseFeeCost || 0) -
      (input.agencyFees || 0) - (input.diagnosticsCosts || 0) - (input.propertyTaxProration || 0) - (input.otherCessionCosts || 0);
    
    return {
      acquisitionBase,
      acquisitionFeesUsed,
      worksUsed,
      grossCapitalGain,
      holdingYears,
      irAllowancePercent,
      psAllowancePercent,
      irTaxableBase,
      psTaxableBase,
      irTax,
      psTax,
      surcharge: surchargeCalc.amount,
      surchangeTranche: surchargeCalc.tranche,
      isRpExempt: false,
      isFirstSaleExempt: false,
      exemptionReasons: [],
      ira,
      totalTax,
      netProceeds,
      calculationDate: new Date().toISOString()
    };
  }
  
  // SCI IS calculation
  if (input.role === 'sci_is') {
    const vnc = input.vnc || 0;
    const cessionFees = input.cessionFeesDeductible || 0;
    const sciIsResult = input.salePrice - (vnc + cessionFees);
    
    const pmeThreshold = input.pmeSmeThreshold || 42500;
    let sciIsTax = 0;
    
    if (sciIsResult <= pmeThreshold) {
      sciIsTax = sciIsResult * 0.15;
    } else {
      sciIsTax = pmeThreshold * 0.15 + (sciIsResult - pmeThreshold) * 0.25;
    }
    
    const distributedDividends = input.distributedDividends || 0;
    const sciPfuTax = distributedDividends * 0.30;
    
    const totalTax = sciIsTax + sciPfuTax;
    const iraCalc = calculateIRA({
      crd: input.crd || 0,
      iraMode: input.iraMode,
      iraPct: input.iraPct,
      annualInterestRate: input.annualInterestRate
    });
    const ira = iraCalc.amount;
    
    const netProceeds = input.salePrice - totalTax - (input.crd || 0) - ira - (input.releaseFeeCost || 0) -
      (input.agencyFees || 0) - (input.diagnosticsCosts || 0) - (input.propertyTaxProration || 0) - (input.otherCessionCosts || 0);
    
    return {
      acquisitionBase,
      acquisitionFeesUsed,
      worksUsed,
      grossCapitalGain,
      holdingYears,
      irAllowancePercent: 0,
      psAllowancePercent: 0,
      irTaxableBase: 0,
      psTaxableBase: 0,
      irTax: 0,
      psTax: 0,
      surcharge: 0,
      sciIsResult,
      sciIsTax,
      sciPfuTax,
      isRpExempt: false,
      isFirstSaleExempt: false,
      exemptionReasons: [],
      ira,
      totalTax,
      netProceeds,
      calculationDate: new Date().toISOString()
    };
  }
  
  // Fallback (should not reach here)
  throw new Error('Invalid role specified');
}

/**
 * Build enriched result payload with all sections
 * Appelle calculateCapitalGain et réorganise tout en format enrichi
 */
export function buildEnrichedResult(input: CapitalGainInput): EnrichedResult {
  // Appeler le calcul de base
  const baseResult = calculateCapitalGain(input);
  
  // Calculer période de détention avec mois
  const holding = calculateHoldingPeriod(input.purchaseDate, input.saleDate);
  
  // Calcul frais de cession totaux
  const feesAndLoanEnabled = input.feesAndLoanEnabled || false;
  const crd = input.crd || 0;
  const iraCalc = calculateIRA({
    crd,
    iraMode: input.iraMode,
    iraPct: input.iraPct,
    annualInterestRate: input.annualInterestRate
  });
  const mainlevee = input.releaseFeeCost || 0;
  const agency = input.agencyFees || 0;
  const diagnostics = input.diagnosticsCosts || 0;
  const prorataTf = input.propertyTaxProration || 0;
  const misc = input.otherCessionCosts || 0;
  const feesTotal = crd + iraCalc.amount + mainlevee + agency + diagnostics + prorataTf + misc;
  
  // Nets
  // Prix net vendeur = Prix vente - honoraires agence
  const priceNetVendeur = input.salePrice - agency;
  
  // Net en poche (avant prêt) = Prix - impôts - frais cession NON-PRÊT (agence, diagnostics, prorata TF, divers)
  const nonLoanFees = agency + diagnostics + prorataTf + misc;
  const netBeforeLoan = input.salePrice - baseResult.totalTax - nonLoanFees;
  
  // Net final = Prix - impôts - TOUS frais (y compris CRD + IRA + mainlevée)
  const netFinal = input.salePrice - baseResult.totalTax - feesTotal;
  
  // Calcul % frais acquisition
  const acqFeePct = input.acquisitionFeesType === 'flat' ? 7.5 : 
    (baseResult.acquisitionFeesUsed / input.purchasePrice) * 100;
  
  // Calcul % travaux
  const worksPct = input.worksType === 'flat' ? 15 : 
    (baseResult.worksUsed / input.purchasePrice) * 100;
  const worksEligible = baseResult.holdingYears >= 5 || input.worksType === 'actual';
  
  // Abatements
  const irAbatementAmount = round2(baseResult.grossCapitalGain * (baseResult.irAllowancePercent / 100));
  const psAbatementAmount = round2(baseResult.grossCapitalGain * (baseResult.psAllowancePercent / 100));
  
  return {
    general: {
      address: input.address,
      insee: input.inseeCode,
      dept: input.deptCode,
      propertyType: input.propertyType,
      purchase: { price: input.purchasePrice, date: input.purchaseDate },
      sale: { price: input.salePrice, date: input.saleDate },
      surfaces: {
        habitable: input.surfaceHabitable,
        annexes: input.surfaceAnnexes,
        dpe: input.dpeLabel
      }
    },
    acquisitionBreakdown: {
      purchasePrice: input.purchasePrice,
      acqFees: {
        method: input.acquisitionFeesType === 'flat' ? 'Forfait 7,5%' : 'Réel',
        percent: round2(acqFeePct),
        amount: round2(baseResult.acquisitionFeesUsed)
      },
      works: {
        method: input.worksType === 'flat' ? 'Forfait 15%' : input.worksType === 'actual' ? 'Réel' : 'Aucun',
        percent: round2(worksPct),
        amount: round2(baseResult.worksUsed),
        eligible: worksEligible
      },
      other: round2(input.otherAcquisitionCosts),
      basisTotal: round2(baseResult.acquisitionBase)
    },
    plusValue: {
      pvBrute: round2(baseResult.grossCapitalGain),
      holding: { years: holding.years, months: holding.months }
    },
    abatements: {
      ir: {
        rate: round2(baseResult.irAllowancePercent),
        amount: irAbatementAmount
      },
      ps: {
        rate: round2(baseResult.psAllowancePercent),
        amount: psAbatementAmount
      }
    },
    taxes: {
      ir: {
        base: round2(baseResult.irTaxableBase),
        amount: round2(baseResult.irTax),
        rate: 19
      },
      ps: {
        base: round2(baseResult.psTaxableBase),
        amount: round2(baseResult.psTax),
        rate: 17.2
      },
      surtaxe: {
        amount: round2(baseResult.surcharge),
        applied: baseResult.surcharge > 0,
        tranche: baseResult.surchangeTranche || null
      },
      total: round2(baseResult.totalTax)
    },
    feesAndLoan: {
      enabled: feesAndLoanEnabled,
      crd: round2(crd),
      ira: {
        mode: iraCalc.mode,
        amount: round2(iraCalc.amount),
        selected: iraCalc.selected
      },
      mainlevee: round2(mainlevee),
      agency: round2(agency),
      diagnostics: round2(diagnostics),
      prorataTf: round2(prorataTf),
      misc: round2(misc),
      total: round2(feesTotal)
    },
    nets: {
      priceNetVendeur: round2(priceNetVendeur),
      netBeforeLoan: round2(netBeforeLoan),
      netFinal: round2(netFinal)
    },
    references: {
      bofip: {
        url: 'https://bofip.impots.gouv.fr/bofip/3601-PGP',
        date: '2024'
      },
      servicePublic: {
        url: 'https://www.service-public.fr/particuliers/vosdroits/F10864',
        date: '2024'
      },
      impotsGouv: {
        url: 'https://www.impots.gouv.fr/particulier/plus-value-immobiliere',
        date: '2024'
      },
      dmto: {
        dept: input.deptCode || 'N/A',
        version: '2024',
        sourceUrl: 'https://www.impots.gouv.fr'
      },
      dvf: {
        available: false, // TODO: implémenter DVF dans la prochaine tâche
        count: 0
      }
    },
    meta: {
      tz: 'Europe/Paris',
      generatedAtLocal: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
      generatedAtUTC: new Date().toISOString(),
      rounding: 'Arrondi commercial à 2 décimales'
    }
  };
}
