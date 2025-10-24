import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, FileText, LogOut, Download, Share2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";

// Type enrichi correspondant au payload API (EnrichedResult)
interface SimulationResult {
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
    priceNetVendeur: number;
    netBeforeLoan: number;
    netFinal: number;
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

export default function Home() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Données générales
    address: '',
    inseeCode: '',
    deptCode: '',
    propertyType: 'maison',
    
    // Surfaces & DPE
    surfaceHabitable: '',
    surfaceAnnexes: '',
    dpeLabel: 'D',
    
    // Essentiels
    role: 'pp',
    occupation: 'rs',
    salePrice: '',
    purchasePrice: '',
    purchaseDate: '',
    saleDate: '',
    
    // Acquisition
    acquisitionFeesType: 'flat',
    acquisitionFeesAmount: '0',
    worksType: 'flat',
    worksAmount: '0',
    otherAcquisitionCosts: '0',
    
    // Frais de cession & prêt (zone activable)
    feesAndLoanEnabled: false,
    crd: '0',
    iraMode: 'pct',
    iraPct: '3',
    annualInterestRate: '0',
    releaseFeeCost: '0',
    agencyFees: '0',
    diagnosticsCosts: '0',
    propertyTaxProration: '0',
    otherCessionCosts: '0',
  });
  const [currentSimulationId, setCurrentSimulationId] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResult | null>(null);

  // Create simulation
  const createSimulation = useMutation({
    mutationFn: async (inputData: any) => {
      const response = await apiRequest('/api/simulations', 'POST', inputData);
      return response;
    },
    onSuccess: (data) => {
      setCurrentSimulationId(data.id);
      toast({
        title: "Simulation créée",
        description: "Calcul en cours...",
      });
      computeSimulation.mutate(data.id);
    },
  });

  // Compute simulation
  const computeSimulation = useMutation({
    mutationFn: async (simulationId: string) => {
      const response = await apiRequest(`/api/simulations/${simulationId}/compute`, 'POST');
      return response;
    },
    onSuccess: (data) => {
      setResults(data.resultData);
      queryClient.invalidateQueries({ queryKey: ['/api/simulations'] });
      toast({
        title: "Calcul terminé",
        description: "Les résultats sont disponibles ci-dessous",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build input data with all enriched fields
    const inputData = {
      // Données générales
      address: formData.address || undefined,
      inseeCode: formData.inseeCode || undefined,
      deptCode: formData.deptCode || undefined,
      propertyType: formData.propertyType || undefined,
      
      // Surfaces & DPE
      surfaceHabitable: formData.surfaceHabitable ? parseFloat(formData.surfaceHabitable) : undefined,
      surfaceAnnexes: formData.surfaceAnnexes ? parseFloat(formData.surfaceAnnexes) : undefined,
      dpeLabel: formData.dpeLabel || undefined,
      
      // Essentiels
      role: formData.role,
      occupation: formData.occupation,
      salePrice: parseFloat(formData.salePrice),
      purchasePrice: parseFloat(formData.purchasePrice),
      purchaseDate: formData.purchaseDate,
      saleDate: formData.saleDate,
      
      // Acquisition
      acquisitionFeesType: formData.acquisitionFeesType,
      acquisitionFeesAmount: formData.acquisitionFeesType === 'actual' ? parseFloat(formData.acquisitionFeesAmount) : undefined,
      worksType: formData.worksType,
      worksAmount: formData.worksType === 'actual' ? parseFloat(formData.worksAmount) : undefined,
      otherAcquisitionCosts: parseFloat(formData.otherAcquisitionCosts),
      
      // Frais de cession & prêt
      feesAndLoanEnabled: formData.feesAndLoanEnabled,
      crd: parseFloat(formData.crd),
      iraMode: formData.iraMode as 'pct' | '6months' | undefined,
      iraPct: formData.iraMode === 'pct' ? parseFloat(formData.iraPct) : undefined,
      annualInterestRate: formData.iraMode === '6months' ? parseFloat(formData.annualInterestRate) : undefined,
      releaseFeeCost: parseFloat(formData.releaseFeeCost),
      agencyFees: parseFloat(formData.agencyFees),
      diagnosticsCosts: parseFloat(formData.diagnosticsCosts),
      propertyTaxProration: parseFloat(formData.propertyTaxProration),
      otherCessionCosts: parseFloat(formData.otherCessionCosts),
    };

    createSimulation.mutate(inputData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CalcuNotaire Pro</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Calculateur de Plus-Value Immobilière</CardTitle>
              <CardDescription>Remplissez les champs ci-dessous pour calculer votre plus-value et vos impôts</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Type de vendeur</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                      <SelectTrigger data-testid="select-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pp">Personne Physique (PP)</SelectItem>
                        <SelectItem value="sci_ir">SCI IR</SelectItem>
                        <SelectItem value="sci_is">SCI IS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Select value={formData.occupation} onValueChange={(v) => setFormData({...formData, occupation: v})}>
                      <SelectTrigger data-testid="select-occupation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rp">Résidence Principale</SelectItem>
                        <SelectItem value="rs">Résidence Secondaire</SelectItem>
                        <SelectItem value="first_sale_reinvestment">Première vente + réinvestissement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchasePrice">Prix d'achat (€)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                      required
                      data-testid="input-purchase-price"
                    />
                  </div>

                  <div>
                    <Label htmlFor="salePrice">Prix de vente (€)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                      required
                      data-testid="input-sale-price"
                    />
                  </div>

                  <div>
                    <Label htmlFor="purchaseDate">Date d'acquisition</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                      required
                      data-testid="input-purchase-date"
                    />
                  </div>

                  <div>
                    <Label htmlFor="saleDate">Date de cession</Label>
                    <Input
                      id="saleDate"
                      type="date"
                      value={formData.saleDate}
                      onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
                      required
                      data-testid="input-sale-date"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agencyFees">Frais d'agence (€)</Label>
                    <Input
                      id="agencyFees"
                      type="number"
                      value={formData.agencyFees}
                      onChange={(e) => setFormData({...formData, agencyFees: e.target.value})}
                      data-testid="input-agency-fees"
                    />
                  </div>

                  <div>
                    <Label htmlFor="diagnosticsCosts">Diagnostics (€)</Label>
                    <Input
                      id="diagnosticsCosts"
                      type="number"
                      value={formData.diagnosticsCosts}
                      onChange={(e) => setFormData({...formData, diagnosticsCosts: e.target.value})}
                      data-testid="input-diagnostics"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Données générales</h3>
                  
                  <div>
                    <Label htmlFor="address">Adresse (optionnel)</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="ex: 15 rue de la Paix, 75001 Paris"
                      data-testid="input-address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inseeCode">Code INSEE (optionnel)</Label>
                      <Input
                        id="inseeCode"
                        type="text"
                        pattern="[0-9]{5}"
                        value={formData.inseeCode}
                        onChange={(e) => setFormData({...formData, inseeCode: e.target.value})}
                        placeholder="ex: 75101"
                        data-testid="input-insee-code"
                      />
                    </div>

                    <div>
                      <Label htmlFor="deptCode">Code département (optionnel)</Label>
                      <Input
                        id="deptCode"
                        type="text"
                        pattern="[0-9]{2,3}"
                        value={formData.deptCode}
                        onChange={(e) => setFormData({...formData, deptCode: e.target.value})}
                        placeholder="ex: 75"
                        data-testid="input-dept-code"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="propertyType">Type de bien</Label>
                    <Select value={formData.propertyType} onValueChange={(v) => setFormData({...formData, propertyType: v})}>
                      <SelectTrigger data-testid="select-property-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appartement">Appartement</SelectItem>
                        <SelectItem value="maison">Maison</SelectItem>
                        <SelectItem value="terrain">Terrain</SelectItem>
                        <SelectItem value="immeuble">Immeuble</SelectItem>
                        <SelectItem value="local_commercial">Local commercial</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Surfaces & DPE</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="surfaceHabitable">Surface habitable (m²)</Label>
                      <Input
                        id="surfaceHabitable"
                        type="number"
                        value={formData.surfaceHabitable}
                        onChange={(e) => setFormData({...formData, surfaceHabitable: e.target.value})}
                        data-testid="input-surface-habitable"
                      />
                    </div>

                    <div>
                      <Label htmlFor="surfaceAnnexes">Surface annexes (m²)</Label>
                      <Input
                        id="surfaceAnnexes"
                        type="number"
                        value={formData.surfaceAnnexes}
                        onChange={(e) => setFormData({...formData, surfaceAnnexes: e.target.value})}
                        data-testid="input-surface-annexes"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dpeLabel">Étiquette DPE</Label>
                    <Select value={formData.dpeLabel} onValueChange={(v) => setFormData({...formData, dpeLabel: v})}>
                      <SelectTrigger data-testid="select-dpe-label">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="feesAndLoanEnabled"
                      checked={formData.feesAndLoanEnabled}
                      onCheckedChange={(checked) => setFormData({...formData, feesAndLoanEnabled: checked as boolean})}
                      data-testid="checkbox-fees-enabled"
                    />
                    <Label htmlFor="feesAndLoanEnabled" className="cursor-pointer">
                      Inclure frais de cession et prêt
                    </Label>
                  </div>

                  {formData.feesAndLoanEnabled && (
                    <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="crd">Capital restant dû (€)</Label>
                          <Input
                            id="crd"
                            type="number"
                            value={formData.crd}
                            onChange={(e) => setFormData({...formData, crd: e.target.value})}
                            data-testid="input-crd"
                          />
                        </div>

                        <div>
                          <Label htmlFor="iraMode">Mode de calcul IRA</Label>
                          <Select value={formData.iraMode} onValueChange={(v) => setFormData({...formData, iraMode: v})}>
                            <SelectTrigger data-testid="select-ira-mode">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pct">% pénalités</SelectItem>
                              <SelectItem value="6months">6 mois d'intérêts</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {formData.iraMode === 'pct' && (
                        <div>
                          <Label htmlFor="iraPct">% pénalités IRA</Label>
                          <Input
                            id="iraPct"
                            type="number"
                            value={formData.iraPct}
                            onChange={(e) => setFormData({...formData, iraPct: e.target.value})}
                            placeholder="3"
                            data-testid="input-ira-pct"
                          />
                        </div>
                      )}

                      {formData.iraMode === '6months' && (
                        <div>
                          <Label htmlFor="annualInterestRate">Taux annuel (%)</Label>
                          <Input
                            id="annualInterestRate"
                            type="number"
                            step="0.01"
                            value={formData.annualInterestRate}
                            onChange={(e) => setFormData({...formData, annualInterestRate: e.target.value})}
                            placeholder="1.5"
                            data-testid="input-annual-interest-rate"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="releaseFeeCost">Frais mainlevée (€)</Label>
                          <Input
                            id="releaseFeeCost"
                            type="number"
                            value={formData.releaseFeeCost}
                            onChange={(e) => setFormData({...formData, releaseFeeCost: e.target.value})}
                            data-testid="input-release-fee"
                          />
                        </div>

                        <div>
                          <Label htmlFor="propertyTaxProration">Prorata taxe foncière (€)</Label>
                          <Input
                            id="propertyTaxProration"
                            type="number"
                            value={formData.propertyTaxProration}
                            onChange={(e) => setFormData({...formData, propertyTaxProration: e.target.value})}
                            data-testid="input-property-tax-proration"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="otherCessionCosts">Autres frais (€)</Label>
                        <Input
                          id="otherCessionCosts"
                          type="number"
                          value={formData.otherCessionCosts}
                          onChange={(e) => setFormData({...formData, otherCessionCosts: e.target.value})}
                          data-testid="input-other-cession-costs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createSimulation.isPending || computeSimulation.isPending}
                  data-testid="button-calculate"
                >
                  {createSimulation.isPending || computeSimulation.isPending ? 'Calcul en cours...' : 'Calculer'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Résultats</CardTitle>
              <CardDescription>
                {results ? 'Calcul basé sur les formules BOFiP officielles' : 'Remplissez le formulaire pour voir les résultats'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-6">
                  {/* 1. Données générales */}
                  {results.general && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Données générales</h3>
                      <div className="space-y-1 text-sm">
                        {results.general.address && <p>📍 {results.general.address}</p>}
                        {results.general.insee && <p>INSEE: {results.general.insee}</p>}
                        {results.general.dept && <p>Département: {results.general.dept}</p>}
                        {results.general.propertyType && <p>Type: {results.general.propertyType}</p>}
                        {results.general.surfaces && (
                          <p>Surfaces: {results.general.surfaces.habitable}m² hab. 
                          {results.general.surfaces.annexes && ` + ${results.general.surfaces.annexes}m² annex`}
                          {results.general.surfaces.dpe && ` | DPE ${results.general.surfaces.dpe}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* 2. Base d'acquisition */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Base d'acquisition</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Prix d'achat</span>
                        <span className="font-medium">{formatCurrency(results.acquisitionBreakdown.purchasePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frais acquisition ({results.acquisitionBreakdown.acqFees.method})</span>
                        <span className="font-medium">{formatCurrency(results.acquisitionBreakdown.acqFees.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Travaux ({results.acquisitionBreakdown.works.method})</span>
                        <span className="font-medium">{formatCurrency(results.acquisitionBreakdown.works.amount)}</span>
                      </div>
                      {results.acquisitionBreakdown.other > 0 && (
                        <div className="flex justify-between">
                          <span>Autres frais</span>
                          <span className="font-medium">{formatCurrency(results.acquisitionBreakdown.other)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t font-semibold">
                        <span>Base totale</span>
                        <span>{formatCurrency(results.acquisitionBreakdown.basisTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 3. Plus-value & Abattements */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Plus-value & Abattements</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Plus-value brute</span>
                        <span className="font-bold text-lg" data-testid="text-gross-gain">{formatCurrency(results.plusValue.pvBrute)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durée de détention</span>
                        <span className="font-medium">{results.plusValue.holding.years} ans {results.plusValue.holding.months} mois</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Abattement IR</span>
                        <span>{results.abatements.ir.rate}% = {formatCurrency(results.abatements.ir.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Abattement PS</span>
                        <span>{results.abatements.ps.rate}% = {formatCurrency(results.abatements.ps.amount)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 4. Fiscalité */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Fiscalité</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>IR (19%) sur {formatCurrency(results.taxes.ir.base)}</span>
                        <span className="font-semibold" data-testid="text-ir-tax">{formatCurrency(results.taxes.ir.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PS (17.2%) sur {formatCurrency(results.taxes.ps.base)}</span>
                        <span className="font-semibold" data-testid="text-ps-tax">{formatCurrency(results.taxes.ps.amount)}</span>
                      </div>
                      {results.taxes.surtaxe.applied && (
                        <div className="flex justify-between text-orange-600 dark:text-orange-400">
                          <span>Surtaxe ({results.taxes.surtaxe.tranche})</span>
                          <span className="font-semibold">{formatCurrency(results.taxes.surtaxe.amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total impôts</span>
                        <span className="text-primary" data-testid="text-total-tax">{formatCurrency(results.taxes.total)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 5. Frais de cession & prêt */}
                  {results.feesAndLoan.enabled && (
                    <>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Frais de cession & prêt</h3>
                        <div className="space-y-1 text-sm">
                          {results.feesAndLoan.crd > 0 && (
                            <div className="flex justify-between">
                              <span>Capital restant dû</span>
                              <span>{formatCurrency(results.feesAndLoan.crd)}</span>
                            </div>
                          )}
                          {results.feesAndLoan.ira.amount > 0 && (
                            <div className="flex justify-between">
                              <span>IRA ({results.feesAndLoan.ira.mode})</span>
                              <span>{formatCurrency(results.feesAndLoan.ira.amount)}</span>
                            </div>
                          )}
                          {results.feesAndLoan.mainlevee > 0 && (
                            <div className="flex justify-between">
                              <span>Mainlevée</span>
                              <span>{formatCurrency(results.feesAndLoan.mainlevee)}</span>
                            </div>
                          )}
                          {results.feesAndLoan.agency > 0 && (
                            <div className="flex justify-between">
                              <span>Honoraires agence</span>
                              <span>{formatCurrency(results.feesAndLoan.agency)}</span>
                            </div>
                          )}
                          {results.feesAndLoan.diagnostics > 0 && (
                            <div className="flex justify-between">
                              <span>Diagnostics</span>
                              <span>{formatCurrency(results.feesAndLoan.diagnostics)}</span>
                            </div>
                          )}
                          {results.feesAndLoan.prorataTf > 0 && (
                            <div className="flex justify-between">
                              <span>Prorata taxe foncière</span>
                              <span>{formatCurrency(results.feesAndLoan.prorataTf)}</span>
                            </div>
                          )}
                          {results.feesAndLoan.misc > 0 && (
                            <div className="flex justify-between">
                              <span>Autres frais</span>
                              <span>{formatCurrency(results.feesAndLoan.misc)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t font-semibold">
                            <span>Total frais</span>
                            <span>{formatCurrency(results.feesAndLoan.total)}</span>
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* 6. Synthèse vendeurs */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Synthèse vendeurs</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <span className="text-sm font-medium">Prix net vendeur</span>
                        <span className="font-bold">{formatCurrency(results.nets.priceNetVendeur)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <span className="text-sm font-medium">Net en poche (avant prêt)</span>
                        <span className="font-bold text-green-700 dark:text-green-300">{formatCurrency(results.nets.netBeforeLoan)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <span className="text-sm font-semibold">Net en poche FINAL</span>
                        <span className="text-xl font-bold text-green-800 dark:text-green-200" data-testid="text-net-proceeds">{formatCurrency(results.nets.netFinal)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 7. Référentiels */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Référentiels officiels</h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>• BOFiP ({results.references.bofip.date})</p>
                      <p>• Service-Public.fr ({results.references.servicePublic.date})</p>
                      <p>• impots.gouv.fr ({results.references.impotsGouv.date})</p>
                      <p>• DMTO Dept {results.references.dmto.dept} - v{results.references.dmto.version}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* 8. DVF */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Comparables DVF</h3>
                    {results.references.dvf.available ? (
                      <p className="text-xs text-muted-foreground">{results.references.dvf.count} comparables trouvés</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Aucune donnée disponible</p>
                    )}
                  </div>

                  <Separator />

                  {/* 9. Horodatage */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Généré le: {results.meta.generatedAtLocal} ({results.meta.tz})</p>
                    <p className="text-[10px]">{results.meta.rounding}</p>
                  </div>

                  {/* Export buttons */}
                  {currentSimulationId && (
                    <div className="mt-6 space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => window.open(`/api/simulations/${currentSimulationId}/pdf`, '_blank')}
                          data-testid="button-download-pdf"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => window.open(`/api/simulations/${currentSimulationId}/csv`, '_blank')}
                          data-testid="button-download-csv"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          CSV
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Remplissez le formulaire et cliquez sur "Calculer"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
