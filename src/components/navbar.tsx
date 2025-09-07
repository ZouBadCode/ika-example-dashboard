import { Link, useLocation } from "react-router-dom";
import { buildMenuAndRoutes } from "@/router/registry";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ika from "@/assets/ika.png";
import { ConnectButton } from '@mysten/dapp-kit';
import { useSelectedNetwork } from '@/components/Providers';
function isFolder(node: any) {
  return Array.isArray(node.children) && node.children.length > 0 && !node.path;
}

function TopItem({ node }: { node: any }) {
  if (isFolder(node)) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="font-medium">
            {node.title}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {node.children
            .filter((c: any) => !c.hidden)
            .map((child: any) => (
              <DropdownMenuItem key={child.key} asChild>
                <Link to={child.path!}>{child.title}</Link>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (!node.hidden && node.path) {
    return (
      <Button asChild variant="ghost" size="sm" className="font-medium">
        <Link to={node.path}>{node.title}</Link>
      </Button>
    );
  }

  return null;
}

const NETWORK_LABEL: Record<string, string> = {
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  devnet: 'Devnet',
};

function NetworkSwitcher() {
  const { network, setNetwork } = useSelectedNetwork();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="font-medium min-w-[90px] justify-between">
          {NETWORK_LABEL[network]}<span className="ml-1 text-xs opacity-70">▾</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {(['mainnet','testnet','devnet'] as const).map(n => (
          <DropdownMenuItem
            key={n}
            onClick={() => setNetwork(n)}
            className={network === n ? 'font-semibold text-primary' : ''}
          >
            {NETWORK_LABEL[n]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const { menuTree } = buildMenuAndRoutes();
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ika} alt="Ika Logo" className="w-7 h-7 rounded-full bg-primary/10" />
            <span className="font-semibold">Ika Playground</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {menuTree.map((n) => (
              <TopItem key={n.key} node={n} />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <NetworkSwitcher />
            <ConnectButton />
            <div className="hidden md:block text-xs text-muted-foreground">
              {loc.pathname}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
