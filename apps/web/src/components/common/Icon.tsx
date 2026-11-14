import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  Library,
  List,
  Lock,
  LockOpen,
  MapPin,
  MessageSquareHeart,
  Plus,
  SquareMinus,
  SquarePen,
  SquarePlus,
  Star,
  Trash2,
  X,
} from "lucide-react";

const icons = {
  "bi-arrow-left": ArrowLeft,
  "bi-arrow-left-short": ArrowLeft,
  "bi-arrow-right": ArrowRight,
  "bi-arrow-up-right": ArrowUpRight,
  "bi-chat-square-heart": MessageSquareHeart,
  "bi-check": Check,
  "bi-check-lg": Check,
  "bi-chevron-left": ChevronLeft,
  "bi-chevron-right": ChevronRight,
  "bi-dash-square": SquareMinus,
  "bi-geo-alt": MapPin,
  "bi-images": Images,
  "bi-journals": Library,
  "bi-list": List,
  "bi-lock": Lock,
  "bi-pencil-square": SquarePen,
  "bi-plus-lg": Plus,
  "bi-plus-square": SquarePlus,
  "bi-star": Star,
  "bi-trash3": Trash2,
  "bi-unlock": LockOpen,
  "bi-x": X,
  "bi-x-lg": X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  className?: string;
};

/** Inline SVG icon sized in em so surrounding text-* classes set the
    glyph size. inline-block keeps it in the text flow — Tailwind
    preflight makes bare svgs display:block; -0.125em matches the
    baseline offset bootstrap-icons used on its ::before glyphs. */
export function Icon({ name, className = "" }: IconProps) {
  const Component = icons[name];
  return (
    <Component
      size="1em"
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
    />
  );
}
