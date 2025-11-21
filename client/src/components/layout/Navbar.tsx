import { Link, useLocation } from "wouter";
import { Search, Bell, User, Menu, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@assets/nubinix-logo.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Series", href: "/series" },
    { name: "Movies", href: "/movies" },
    { name: "New & Popular", href: "/new" },
    { name: "My List", href: "/my-list" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-colors duration-300 px-4 md:px-12 py-4 flex items-center justify-between",
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-lg" : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <div className="flex items-center gap-8">
        <Link href="/">
          <div className="cursor-pointer">
            <img src={logo} alt="Nubinix" className="h-10 object-contain" />
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <div
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary cursor-pointer",
                  location === link.href ? "text-white font-bold" : "text-gray-300"
                )}
              >
                {link.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
          <Search className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
          <Bell className="w-5 h-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
               <div className="h-8 w-8 rounded bg-gradient-brand flex items-center justify-center text-white font-bold">
                  N
               </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/admin">
              <DropdownMenuItem className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Account</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Help Center</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
