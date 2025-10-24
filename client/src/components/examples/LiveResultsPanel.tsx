import LiveResultsPanel from '../LiveResultsPanel';

export default function LiveResultsPanelExample() {
  return (
    <div className="max-w-sm">
      <LiveResultsPanel
        grossCapitalGain={150000}
        irAllowance={65}
        psAllowance={85}
        irTax={9975}
        psTax={3870}
        surcharge={2500}
        exemptions={[]}
        netProceeds={425000}
        salePrice={600000}
      />
    </div>
  );
}
