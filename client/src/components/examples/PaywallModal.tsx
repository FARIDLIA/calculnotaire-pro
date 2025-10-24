import { useState } from 'react';
import PaywallModal from '../PaywallModal';
import { Button } from '@/components/ui/button';

export default function PaywallModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>
        Ouvrir le paywall
      </Button>
      <PaywallModal
        open={open}
        onClose={() => setOpen(false)}
        onPurchase={(type) => {
          console.log('Purchase:', type);
          setOpen(false);
        }}
      />
    </div>
  );
}
