import { useState } from 'react';
import RoleSelector from '../RoleSelector';

export default function RoleSelectorExample() {
  const [value, setValue] = useState("pp");
  
  return (
    <div className="max-w-4xl">
      <RoleSelector value={value} onChange={setValue} />
    </div>
  );
}
