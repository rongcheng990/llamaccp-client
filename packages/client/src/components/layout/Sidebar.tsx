import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { t, useLocale } from '@/lib/i18n';
import {
  Compass,
  HardDrive,
  Server,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navKeys = [
  { to: '/', icon: Compass, labelKey: 'nav.discover' },
  { to: '/models', icon: HardDrive, labelKey: 'nav.localModels' },
  { to: '/server', icon: Server, labelKey: 'nav.server' },
  { to: '/downloads', icon: Download, labelKey: 'nav.downloads' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  useLocale(); // re-render on locale change
  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-surface transition-all duration-300',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Cpu className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="ml-2 text-sm font-bold tracking-wide">
            <span className="text-primary">llama</span>
            <span className="text-cyan">.cpp</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navKeys.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{t(item.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
