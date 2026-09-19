import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDot,
  Clock,
  Copy,
  Download,
  Ellipsis,
  ExternalLink,
  Grid3x3,
  Info,
  Lock,
  LogOut,
  Maximize,
  MessageSquare,
  Mic,
  MicOff,
  Minimize,
  MonitorUp,
  Pencil,
  PhoneOff,
  Plus,
  Search,
  Settings,
  Smile,
  Trash2,
  TriangleAlert,
  Unlock,
  Upload,
  UserPlus,
  Users,
  Video,
  VideoOff,
  X,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'
import { BreakRoom, Knock, Office, Provider, RaiseHand, Reception } from './customIcons'

/** Anything the Icon component can render: a Lucide icon or one of ours. */
export type IconComponent = ComponentType<LucideProps>

/**
 * The name table. This is the only file in the repository that names a Lucide
 * component, which is the whole point: an upstream rename is one line here
 * rather than an edit in every consumer.
 *
 * Names are ours, not Lucide's, and describe the job rather than the drawing —
 * `share` rather than `monitor-up`, `record` rather than `circle-dot`. Where
 * Lucide's name carries a versioning artefact (`Trash2`) or a shape that is not
 * the meaning (`Ellipsis`), ours drops it. A few names coincide with Lucide's
 * simply because the obvious word is the same.
 */
export const iconComponents = {
  // Call and media
  mic: Mic,
  'mic-off': MicOff,
  video: Video,
  'video-off': VideoOff,
  share: MonitorUp,
  record: CircleDot,
  reactions: Smile,
  'leave-call': PhoneOff,
  'call-view': Grid3x3,
  maximize: Maximize,
  minimize: Minimize,

  // People
  users: Users,
  invite: UserPlus,

  // Rooms and status
  lock: Lock,
  unlock: Unlock,
  bell: Bell,
  message: MessageSquare,

  // Navigation and actions
  search: Search,
  settings: Settings,
  'log-out': LogOut,
  check: Check,
  close: X,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  alert: TriangleAlert,
  info: Info,
  trash: Trash2,
  edit: Pencil,
  plus: Plus,
  more: Ellipsis,
  calendar: Calendar,
  clock: Clock,
  download: Download,
  upload: Upload,
  copy: Copy,
  'external-link': ExternalLink,

  // Drawn for this product; see customIcons.tsx for why each exists
  knock: Knock,
  'raise-hand': RaiseHand,
  reception: Reception,
  'break-room': BreakRoom,
  office: Office,
  provider: Provider,
} as const satisfies Record<string, IconComponent>

/**
 * Every name the kit renders. Typed as a union so an unknown name is a
 * compile error rather than a blank space at runtime.
 */
export type IconName = keyof typeof iconComponents

/** Sorted for the Storybook page and for tests that walk every icon. */
export const iconNames = Object.keys(iconComponents).sort() as IconName[]

/**
 * Sizes, matching the type scale. There is no numeric size prop: anything
 * larger than 32 is an illustration, not an icon, and the union is what keeps
 * that true without a runtime check nobody reads.
 */
export const iconSizes = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 } as const

export type IconSize = keyof typeof iconSizes
