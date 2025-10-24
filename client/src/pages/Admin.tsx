import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDMTOTable from "@/components/AdminDMTOTable";
import ThemeToggle from "@/components/ThemeToggle";
import { Calculator, Settings, Database, FileText } from "lucide-react";

export default function Admin() {
  //todo: remove mock functionality
  const mockDMTORates = [
    {
      deptCode: "13",
      deptName: "Bouches-du-Rhône",
      dmtoRate: 5.00,
      version: "v2025-06",
      effectiveFrom: "2025-06-01",
      sourceUrl: "https://www.impots.gouv.fr/droits-denregistrement"
    },
    {
      deptCode: "75",
      deptName: "Paris",
      dmtoRate: 5.00,
      version: "v2025-06",
      effectiveFrom: "2025-06-01",
      sourceUrl: "https://www.impots.gouv.fr/droits-denregistrement"
    },
    {
      deptCode: "69",
      deptName: "Rhône",
      dmtoRate: 5.00,
      version: "v2025-06",
      effectiveFrom: "2025-06-01",
      sourceUrl: "https://www.impots.gouv.fr/droits-denregistrement"
    },
    {
      deptCode: "33",
      deptName: "Gironde",
      dmtoRate: 5.00,
      version: "v2025-06",
      effectiveFrom: "2025-06-01",
      sourceUrl: "https://www.impots.gouv.fr/droits-denregistrement"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CalcuNotaire Pro</h1>
                <p className="text-xs text-muted-foreground">Administration</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Back-Office Administrateur</h2>
            <p className="text-muted-foreground">Gestion des données et configuration du système</p>
          </div>

          <Tabs defaultValue="dmto" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dmto" data-testid="tab-dmto">
                <Database className="w-4 h-4 mr-2" />
                Taux DMTO
              </TabsTrigger>
              <TabsTrigger value="sources" data-testid="tab-sources">
                <FileText className="w-4 h-4 mr-2" />
                Sources & Barèmes
              </TabsTrigger>
              <TabsTrigger value="legal" data-testid="tab-legal">
                <Settings className="w-4 h-4 mr-2" />
                Mentions légales
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dmto" className="space-y-6">
              <AdminDMTOTable
                rates={mockDMTORates}
                onUpload={() => console.log('Upload DMTO CSV')}
                onPublish={(version) => console.log('Publish version:', version)}
              />
            </TabsContent>

            <TabsContent value="sources" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Sources officielles</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">URL BOFiP (Surtaxe)</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        defaultValue="https://bofip.impots.gouv.fr/bofip/5892-PGP"
                        data-testid="input-bofip-url"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">Date de version</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        defaultValue="2025-01-01"
                        data-testid="input-bofip-date"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="legal" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Bandeau légal PDF</h3>
                <textarea
                  className="w-full h-32 px-3 py-2 border rounded-md text-sm"
                  defaultValue="Simulation indicative — ce document ne se substitue pas à l'avis et aux actes d'un Notaire. Les calculs s'appuient sur les sources officielles citées et sur les données saisies par l'utilisateur, sous sa responsabilité."
                  data-testid="textarea-legal-banner"
                />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
