import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.jpg";

const navLinks = [
  { label: "Usluge", href: "#services" },
  { label: "Značajke", href: "#features" },
  { label: "Rezultati", href: "#rezultati" },
  { label: "Edukacija", href: "#edukacija" },
  { label: "Iskustva", href: "#reviews" },
  { label: "Kontakt", href: "#contact" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("");
  const navigate = useNavigate();

  // Scroll spy to detect active section
  const updateActiveSection = useCallback(() => {
    const sections = navLinks.map(link => link.href.replace('#', ''));
    const scrollPosition = window.scrollY + 150; // Offset for navbar height

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i]);
      if (section && section.offsetTop <= scrollPosition) {
        setActiveSection(`#${sections[i]}`);
        return;
      }
    }
    setActiveSection("");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      updateActiveSection();
    };
    window.addEventListener("scroll", handleScroll);
    // Initial check
    updateActiveSection();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateActiveSection]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setUserEmail(session?.user?.email ?? "");
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setUserEmail(session?.user?.email ?? "");
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserEmail("");
    navigate("/");
  };

  const getUserDisplayName = () => {
    if (!userEmail) return "Korisnik";
    const name = userEmail.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const isActive = (href: string) => activeSection === href;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container px-2 md:px-4">
        <div className="flex items-center justify-between h-auto min-h-[56px] md:h-20 py-2 md:py-0">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <img src={logo} alt="EM Capital Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover" />
            <span className="text-lg md:text-xl font-heading font-bold hidden sm:block">EM Capital</span>
          </a>

          {/* Navigation Links - Visible on all screen sizes */}
          <div className="flex-1 mx-1 md:mx-8">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 md:gap-8 justify-center">
              {navLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`transition-all duration-300 font-medium text-[11px] md:text-sm whitespace-nowrap py-0.5 md:py-2 opacity-0 animate-fade-in hover:scale-105 relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:transition-transform after:duration-300 ${
                    isActive(link.href)
                      ? "text-primary after:scale-x-100"
                      : "text-foreground/80 hover:text-primary after:scale-x-0 after:origin-bottom-right hover:after:scale-x-100 hover:after:origin-bottom-left"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* CTA / User Profile - Desktop */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="max-w-[120px] truncate">{getUserDisplayName()}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Moj Profil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Odjavi se
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Prijava
                </Button>
              </Link>
            )}
            <a href="#signup">
              <Button variant="hero" size="lg">
                Započni Odmah
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`transition-colors font-medium py-2 flex items-center gap-2 ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-foreground/80 hover:text-primary"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {isActive(link.href) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  {link.label}
                </a>
              ))}
              
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-2 px-1 border-t border-border mt-2 pt-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <User className="w-4 h-4" />
                      Moj Profil
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 text-destructive hover:text-destructive"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Odjavi se
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                    <User className="w-4 h-4" />
                    Prijava
                  </Button>
                </Link>
              )}
              
              <a href="#signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="hero" size="lg" className="mt-2 w-full">
                  Započni Odmah
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
