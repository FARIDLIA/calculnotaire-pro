import { useState } from 'react';
import PropertyTypeSelector from '../PropertyTypeSelector';

export default function PropertyTypeSelectorExample() {
  const [value, setValue] = useState("maison");
  
  return (
    <div className="max-w-3xl">
      <PropertyTypeSelector value={value} onChange={setValue} />
    </div>
  );
}
