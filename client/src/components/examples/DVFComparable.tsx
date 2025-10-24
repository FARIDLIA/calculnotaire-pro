import DVFComparable from '../DVFComparable';

export default function DVFComparableExample() {
  return (
    <div className="max-w-md">
      <DVFComparable
        address="12 Rue de la République, 13001 Marseille"
        price={385000}
        date="15/03/2024"
        surface={95}
        propertyType="Appartement"
        distance={0.8}
        etalabLink="https://app.dvf.etalab.gouv.fr/"
      />
    </div>
  );
}
