"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { EditableLogoImage } from '@/components/shared/content-editor';

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const ITEMS = [
  {
    label: "Features",
    href: "#",
    dropdownItems: [
      {
        title: "Modern product teams",
        href: "#",
        description:
          "Mainline is built on the habits that make the best product teams successful",
      },
      {
        title: "Resource Allocation",
        href: "#",
        description: "Mainline your resource allocation and execution",
      },
    ],
  },
  { label: "About Us", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Contact", href: "#" },
];

interface Navbar6Props {
  logo?: {
    src: string;
    alt: string;
    title?: string;
  };
  editable?: boolean;
  onLogoChange?: (imageUrl: string | null) => void;
}

const Navbar6 = ({
  logo = {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg",
    alt: "logo",
    title: "Logo",
  },
  editable = false,
  onLogoChange,
}: Navbar6Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentLogoSrc, setCurrentLogoSrc] = useState(logo.src);

  const handleLogoUpdate = (newImageUrl: string | null) => {
    if (newImageUrl) {
      setCurrentLogoSrc(newImageUrl);
    }
    if (onLogoChange) {
      onLogoChange(newImageUrl);
    }
  };

  return (
    <section className="absolute top-5 left-1/2 z-50 w-[min(90%,700px)] -translate-x-1/2 rounded-full border bg-background/70 backdrop-blur-md lg:top-12">
      <div className="flex items-center justify-between px-6 py-3">
        <a
          href={editable ? undefined : "/"}
          className="flex shrink-0 items-center gap-2"
          onClick={editable ? (e) => e.preventDefault() : undefined}
        >
          <EditableLogoImage
            src={currentLogoSrc}
            alt={logo.alt}
            title={logo.title}
            className="w-10 h-10"
            fallbackText={logo.title || logo.alt}
            onUpdate={handleLogoUpdate}
            editable={editable}
            showFallback={true}
          />
        </a>

        {/* Desktop Navigation */}
        <NavigationMenu className="max-lg:hidden">
          <NavigationMenuList>
            {ITEMS.map((link) =>
              link.dropdownItems ? (
                <NavigationMenuItem key={link.label} className="">
                  <NavigationMenuTrigger className="bg-transparent! px-1.5 data-[state=open]:bg-accent/50">
                    {link.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-[400px] space-y-2 p-4">
                      {link.dropdownItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <a
                              href={item.href}
                              className="group flex gap-4 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="transition-transform duration-300 group-hover:translate-x-1">
                                <div className="mb-1 text-sm leading-none font-medium">
                                  {item.title}
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={link.label} className="">
                  <a
                    href={link.href}
                    className={cn(
                      "relative bg-transparent px-1.5 text-sm font-medium text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </a>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2.5">
          <a href="/login" className="max-lg:hidden">
            <Button variant="outline">
              <span className="relative z-10">Login</span>
            </Button>
          </a>

          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            className="relative flex size-8 text-muted-foreground lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <div className="absolute top-1/2 left-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
              <span
                aria-hidden="true"
                className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "rotate-45" : "-translate-y-1.5"}`}
              ></span>
              <span
                aria-hidden="true"
                className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "opacity-0" : ""}`}
              ></span>
              <span
                aria-hidden="true"
                className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "-rotate-45" : "translate-y-1.5"}`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/*  Mobile Menu Navigation */}
      <div
        className={cn(
          "fixed inset-x-0 top-[calc(100%+1rem)] flex flex-col rounded-2xl border bg-background p-6 transition-all duration-300 ease-in-out lg:hidden",
          isMenuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-4 opacity-0",
        )}
      >
        <nav className="flex flex-1 flex-col divide-y divide-border">
          {ITEMS.map((link) =>
            link.dropdownItems ? (
              <div key={link.label} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === link.label ? null : link.label,
                    )
                  }
                  className="flex w-full items-center justify-between text-base font-medium text-primary"
                >
                  {link.label}
                  <ChevronRight
                    className={cn(
                      "size-4 transition-transform duration-200",
                      openDropdown === link.label ? "rotate-90" : "",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openDropdown === link.label
                      ? "mt-4 max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0",
                  )}
                >
                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    {link.dropdownItems.map((item) => (
                      <a
                        key={item.title}
                        href={item.href}
                        className="group block rounded-md p-2 transition-colors hover:bg-accent"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                      >
                        <div className="transition-transform duration-200 group-hover:translate-x-1">
                          <div className="font-medium text-primary">
                            {item.title}
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "py-4 text-base font-medium text-primary transition-colors first:pt-0 last:pb-0 hover:text-primary/80",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
      </div>
    </section>
  );
};

// Export with expected name for registry
export { Navbar6, Navbar6 as NavBar3 };
