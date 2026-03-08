import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Search, User, ShoppingCart, Menu, Sun, Moon, ChevronDown, Heart, LogOut, KeyRound, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import GlobalSearch from "@/components/global-search";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Category, SubCategory } from "@/lib/types";
import { oliGetJson, oliUrl } from "@/lib/oliApi";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import Chatbot from "@/components/chatbot/Chatbot";

interface LayoutProps {
  children: ReactNode;
}
  
export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  const { isAuthenticated, displayName, logout } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const nextIsDark = saved ? saved === "dark" : !!prefersDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: [oliUrl("/api/categories")],
    queryFn: () => oliGetJson<Category[]>("/api/categories"),
  });

  const { data: subcategories } = useQuery<SubCategory[]>({
    queryKey: [oliUrl("/api/subcategories")],
    queryFn: () => oliGetJson<SubCategory[]>("/api/subcategories"),
  });

  const subcategoriesByCategoryId = useMemo(() => {
    const m = new Map<number, SubCategory[]>();
    for (const sc of subcategories ?? []) {
      const arr = m.get(sc.categoryId) ?? [];
      arr.push(sc);
      m.set(sc.categoryId, arr);
    }
    m.forEach((arr) => {
      arr.sort((a: SubCategory, b: SubCategory) => a.name.localeCompare(b.name));
    });
    return m;
  }, [subcategories]);

  const isActiveLink = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-white">
    

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center gap-3 cursor-pointer">
                <img src="/logo.png" alt="RAJYADU" className="h-20 w-40" />
                
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 justify-center mx-8">
                <GlobalSearch placeholder="Search for products, categories..." />
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                onClick={() => setIsDark((v) => !v)}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Search Toggle - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label="Account">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="truncate">{displayName || "Account"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/account/orders" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/account/change-password" className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Change Password
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onSelect={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" aria-label="Login">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="relative" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="mt-8 flex h-full flex-col">
                    <div className="flex-1 overflow-auto pr-2">
                      <div className="space-y-1">
                        <SheetClose asChild>
                          <Link
                            href="/"
                            className={`block rounded-md px-3 py-2 text-lg font-medium transition-colors ${
                              isActiveLink("/") ? "text-primary" : "text-gray-700 hover:text-primary"
                            }`}
                          >
                            Home
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/wishlist"
                            className={`block rounded-md px-3 py-2 text-lg font-medium transition-colors ${
                              isActiveLink("/wishlist")
                                ? "text-primary"
                                : "text-gray-700 hover:text-primary"
                            }`}
                          >
                            Wishlist
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/cart"
                            className={`block rounded-md px-3 py-2 text-lg font-medium transition-colors ${
                              isActiveLink("/cart") ? "text-primary" : "text-gray-700 hover:text-primary"
                            }`}
                          >
                            Cart
                          </Link>
                        </SheetClose>

                        <div className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Categories
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          {(categories ?? []).map((c) => {
                            const subs = subcategoriesByCategoryId.get(c.id) ?? [];

                            if (subs.length === 0) {
                              return (
                                <SheetClose asChild key={c.id}>
                                  <Link
                                    href={`/category/${c.slug}`}
                                    className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                                      isActiveLink(`/category/${c.slug}`)
                                        ? "text-primary"
                                        : "text-gray-700 hover:text-primary"
                                    }`}
                                  >
                                    {c.name}
                                  </Link>
                                </SheetClose>
                              );
                            }

                            return (
                              <AccordionItem key={c.id} value={`cat-${c.id}`} className="border-b-0">
                                <AccordionTrigger className="rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:no-underline">
                                  {c.name}
                                </AccordionTrigger>
                                <AccordionContent className="pb-2">
                                  <div className="space-y-1 pl-2">
                                    <SheetClose asChild>
                                      <Link
                                        href={`/category/${c.slug}`}
                                        className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                                          isActiveLink(`/category/${c.slug}`)
                                            ? "text-primary"
                                            : "text-gray-600 hover:text-primary"
                                        }`}
                                      >
                                        All {c.name}
                                      </Link>
                                    </SheetClose>
                                    {subs.map((sc) => (
                                      <SheetClose asChild key={sc.id}>
                                        <Link
                                          href={`/category/${c.slug}?sub=${encodeURIComponent(sc.slug)}`}
                                          className="block rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:text-primary"
                                        >
                                          {sc.name}
                                        </Link>
                                      </SheetClose>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>

                        <div className="mt-4 space-y-1">
                          <SheetClose asChild>
                            <Link
                              href="/about"
                              className={`block rounded-md px-3 py-2 text-lg font-medium transition-colors ${
                                isActiveLink("/about")
                                  ? "text-primary"
                                  : "text-gray-700 hover:text-primary"
                              }`}
                            >
                              About
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              href="/contact"
                              className={`block rounded-md px-3 py-2 text-lg font-medium transition-colors ${
                                isActiveLink("/contact")
                                  ? "text-primary"
                                  : "text-gray-700 hover:text-primary"
                              }`}
                            >
                              Contact
                            </Link>
                          </SheetClose>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden pb-4">
              <GlobalSearch placeholder="Search for products, categories..." />
            </div>
          )}
        </div>

        {/* Navigation - Desktop */}
        <nav className="bg-gray-50 border-t border-gray-200 hidden md:block">
          <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-12">
              <div className="no-scrollbar flex w-full items-center justify-center gap-1 overflow-visible px-2">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors px-4 py-2 whitespace-nowrap ${
                    isActiveLink("/") ? "text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  Home
                </Link>

                {(categories ?? []).map((c) => {
                  const subs = subcategoriesByCategoryId.get(c.id) ?? [];
                  const active = isActiveLink(`/category/${c.slug}`);
                  const itemClass = `text-sm font-medium transition-colors px-4 py-2 whitespace-nowrap ${
                    active ? "text-primary" : "text-gray-600 hover:text-primary"
                  }`;

                  if (subs.length === 0) {
                    return (
                      <Link key={c.id} href={`/category/${c.slug}`} className={itemClass}>
                        {c.name}
                      </Link>
                    );
                  }

                  return (
                    <div key={c.id} className="relative group">
                      <Link
                        href={`/category/${c.slug}`}
                        className={`${itemClass} inline-flex items-center gap-1`}
                      >
                        {c.name}
                        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                      </Link>

                      <div className="absolute left-0 top-full z-50 hidden min-w-56 rounded-md border bg-white shadow-lg group-hover:block">
                        <div className="p-2">
                          {subs.map((sc) => (
                            <Link
                              key={sc.id}
                              href={`/category/${c.slug}?sub=${encodeURIComponent(sc.slug)}`}
                              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                            >
                              {sc.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Link
                  href="/about"
                  className={`text-sm font-medium transition-colors px-4 py-2 whitespace-nowrap ${
                    isActiveLink("/about") ? "text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className={`text-sm font-medium transition-colors px-4 py-2 whitespace-nowrap ${
                    isActiveLink("/contact") ? "text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-4">
                <img src="/logo.png" alt="" className="h-30 w-40" />
                <h3 className="text-xl font-bold"></h3>
              </div>
           
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/rajyadu.dhudaramorganics?utm_source=qr&igsh=MW15dTZvZnN6N3c0NA==" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://www.facebook.com/share/1Dnbc5YrU9/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/terms-conditions" className="text-gray-400 hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
               
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                {categories?.map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/category/${cat.slug}`} className="text-gray-400 hover:text-white transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
                {!categories || categories.length === 0 && (
                  <li className="text-gray-500">Loading categories...</li>
                )}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Customer Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        
          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 Discover RAJYADU. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
