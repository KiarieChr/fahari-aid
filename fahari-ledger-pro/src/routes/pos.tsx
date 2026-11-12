import { createFileRoute } from '@tanstack/react-router';
import { RestaurantPOS } from '@/components/pos/RestaurantPOS';

export const Route = createFileRoute('/pos')({
  component: RestaurantPOS,
});
