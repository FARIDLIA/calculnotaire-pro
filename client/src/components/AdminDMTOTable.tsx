import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Upload, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DMTORate {
  deptCode: string;
  deptName: string;
  dmtoRate: number;
  version: string;
  effectiveFrom: string;
  sourceUrl: string;
}

interface AdminDMTOTableProps {
  rates: DMTORate[];
  onUpload: () => void;
  onPublish: (version: string) => void;
}

export default function AdminDMTOTable({ rates, onUpload, onPublish }: AdminDMTOTableProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Gestion DMTO</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Taux départementaux des droits de mutation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onUpload} data-testid="button-upload-csv">
            <Upload className="w-4 h-4 mr-2" />
            Importer CSV
          </Button>
          <Button onClick={() => onPublish('v2025-06')} data-testid="button-publish-version">
            <CheckCircle className="w-4 h-4 mr-2" />
            Publier v2025-06
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Département</TableHead>
              <TableHead className="text-right">Taux DMTO</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Date d'effet</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={rate.deptCode} data-testid={`row-dmto-${rate.deptCode}`}>
                <TableCell className="font-mono font-medium">{rate.deptCode}</TableCell>
                <TableCell>{rate.deptName}</TableCell>
                <TableCell className="text-right font-mono">{rate.dmtoRate.toFixed(2)}%</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {rate.version}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(rate.effectiveFrom).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(rate.sourceUrl, '_blank')}
                    data-testid={`button-source-${rate.deptCode}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
