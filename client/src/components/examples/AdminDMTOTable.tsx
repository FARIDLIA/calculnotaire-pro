import AdminDMTOTable from '../AdminDMTOTable';

export default function AdminDMTOTableExample() {
  const mockRates = [
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
    <div className="max-w-6xl">
      <AdminDMTOTable
        rates={mockRates}
        onUpload={() => console.log('Upload clicked')}
        onPublish={(version) => console.log('Publish clicked:', version)}
      />
    </div>
  );
}
