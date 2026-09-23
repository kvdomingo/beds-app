import { Link, useLocation } from "@tanstack/react-router";

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
    label: "Patients",
    href: "/patients",
  },
];

export function Navbar() {
  const location = useLocation();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {links.map((link) => (
          <NavigationMenuItem key={link.href}>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              asChild
              active={location.pathname === link.href}
            >
              <Link to={link.href}>{link.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
