import { NotifyForm } from '@/components/interactive/NotifyForm';
import { CLOSED } from '@/content/shop';

/* Tell me when the shop opens. Tagged as=merch. */
export function ShopNotify() {
  return (
    <NotifyForm
      as="merch"
      copy={{
        label: CLOSED.notifyLabel,
        button: CLOSED.notifyButton,
        sending: CLOSED.sending,
        ok: CLOSED.ok,
        error: CLOSED.error,
      }}
    />
  );
}
