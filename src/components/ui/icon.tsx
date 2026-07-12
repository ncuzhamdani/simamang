import {
  Wallet,
  Landmark,
  Smartphone,
  CreditCard,
  TrendingUp,
  Briefcase,
  Gift,
  Laptop,
  Utensils,
  Car,
  ShoppingCart,
  Zap,
  Home,
  HeartPulse,
  BookOpen,
  Clapperboard,
  HandHeart,
  PiggyBank,
  Receipt,
  MoreHorizontal,
  Tag,
  Target,
  Shield,
  Plane,
  Bike,
  Coins,
  Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  wallet: Wallet,
  landmark: Landmark,
  smartphone: Smartphone,
  "credit-card": CreditCard,
  "trending-up": TrendingUp,
  briefcase: Briefcase,
  gift: Gift,
  laptop: Laptop,
  utensils: Utensils,
  car: Car,
  "shopping-cart": ShoppingCart,
  zap: Zap,
  home: Home,
  "heart-pulse": HeartPulse,
  "book-open": BookOpen,
  clapperboard: Clapperboard,
  "hand-heart": HandHeart,
  "piggy-bank": PiggyBank,
  receipt: Receipt,
  "more-horizontal": MoreHorizontal,
  tag: Tag,
  target: Target,
  shield: Shield,
  plane: Plane,
  bike: Bike,
  coins: Coins,
  building: Building2,
};

export const AVAILABLE_ICONS = Object.keys(MAP);

export function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] ?? Tag;
  return <Icon className={className} />;
}
