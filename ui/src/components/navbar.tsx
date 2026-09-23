import { Link } from "@tanstack/react-router";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const links = [
  {
    label: "Wards",
    href: "/",
  },
  {
    label: "Beds",
    href: "/beds",
  },
  {
    label: "Patients",
    href: "/patients",
  },
];

export function Navbar() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {links.map((link) => (
          <NavigationMenuItem key={link.href}>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <Link to={link.href}>{link.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
