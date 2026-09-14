import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Menu,
  X,
  Instagram,
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  ArrowUp,
  Leaf,
  ShieldCheck,
  Sparkles,
  Crown,
  HandHeart,
  Gem,
  Star,
  ChevronDown,
} from "lucide-react";

import heroImg from "@/assets/hero-mehndi.jpg";
import serviceBridal from "@/assets/service-bridal.jpg";
import serviceParty from "@/assets/service-party.jpg";
import serviceCustom from "@/assets/service-custom.jpg";
import productHenna from "@/assets/product-henna-cone.jpg";
import productNail from "@/assets/product-nail-cone.jpg";
import gBridal1 from "@/assets/gallery-bridal-1.jpg";
import gBridal2 from "@/assets/gallery-bridal-2.jpg";
import gBridal3 from "@/assets/gallery-bridal-3.jpg";
import gParty1 from "@/assets/gallery-party-1.jpg";
import gParty2 from "@/assets/gallery-party-2.jpg";
import gParty3 from "@/assets/gallery-party-3.jpg";
import gCustom1 from "@/assets/gallery-custom-1.jpg";
import gCustom2 from "@/assets/gallery-custom-2.jpg";
import gCustom3 from "@/assets/gallery-custom-3.jpg";
import gProduct1 from "@/assets/gallery-product-1.jpg";
import gProduct2 from "@/assets/gallery-product-2.jpg";
import gProduct3 from "@/assets/gallery-product-3.jpg";

export const Route = createFileRoute("/")({
  component: SoulconeHome,
});

const NAV = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Products", href: "#products" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const FEATURES = [
  { icon: Leaf, title: "100% Organic", desc: "Pure henna leaves, sourced ethically and prepared with care." },
  { icon: ShieldCheck, title: "Chemical Free", desc: "No PPD, no dyes, no harsh additives — ever." },
  { icon: Sparkles, title: "Long Lasting Stain", desc: "Rich, deep maroon stain that lasts up to two weeks." },
  { icon: Crown, title: "Bridal Specialists", desc: "Trained artists for the most intricate bridal designs." },
  { icon: HandHeart, title: "Handcrafted Cones", desc: "Every cone is rolled by hand for the finest flow." },
  { icon: Gem, title: "Premium Quality", desc: "A luxury experience from consultation to final stain." },
];

const SERVICES = [
  { img: serviceBridal, title: "Bridal Mehndi", desc: "Full-hand, full-arm, and feet designs for your wedding day.", cta: "Book Bridal" },
  { img: serviceParty, title: "Party Mehndi", desc: "Elegant designs for engagements, sangeets, and celebrations.", cta: "Book Party" },
  { img: serviceCustom, title: "Custom Mehndi", desc: "Personalized artwork — modern, minimal, or traditional.", cta: "Design Yours" },
  { img: productHenna, title: "Organic Henna Cones", desc: "Freshly made cones delivered to your doorstep.", cta: "Order Cones" },
];

const GALLERY: { src: string; cat: "bridal" | "party" | "custom" | "products"; alt: string }[] = [
  { src: gBridal1, cat: "bridal", alt: "Bridal mehndi hands" },
  { src: gBridal2, cat: "bridal", alt: "Bridal mehndi arm" },
  { src: gBridal3, cat: "bridal", alt: "Bridal mehndi feet" },
  { src: gParty1, cat: "party", alt: "Party mehndi floral" },
  { src: gParty2, cat: "party", alt: "Party mehndi bokeh" },
  { src: gParty3, cat: "party", alt: "Party mehndi mandala" },
  { src: gCustom1, cat: "custom", alt: "Custom minimalist henna" },
  { src: gCustom2, cat: "custom", alt: "Custom shoulder henna" },
  { src: gCustom3, cat: "custom", alt: "Custom name henna" },
  { src: gProduct1, cat: "products", alt: "Handmade henna cones" },
  { src: gProduct2, cat: "products", alt: "Organic henna powder" },
  { src: gProduct3, cat: "products", alt: "Luxury cone gift box" },
];

const PRODUCTS = [
  { img: productHenna, title: "Organic Henna Cone", desc: "Freshly rolled, chemical-free cones for a rich maroon stain.", price: "₹—" },
  { img: productNail, title: "Nail Cone", desc: "Fine-tip cones designed for delicate nail-art detailing.", price: "₹—" },
];

const REVIEWS = [
  { name: "Aditi R.", rating: 5, text: "The bridal mehndi was breathtaking. The stain deepened beautifully by the wedding day." },
  { name: "Sneha K.", rating: 5, text: "Their cones are the best I've used — smooth flow and rich color every single time." },
  { name: "Priya M.", rating: 5, text: "Soulcone made my sangeet unforgettable. Elegant, professional, and so warm." },
];

const FAQS = [
  { q: "Is the henna 100% organic?", a: "Yes. We use pure, sifted henna leaves with natural essential oils — no PPD, no chemicals." },
  { q: "How long does the stain last?", a: "With proper aftercare, the stain lasts 10–14 days and deepens over the first 48 hours." },
  { q: "Do you travel for bridal bookings?", a: "Yes, we serve Udupi and nearby regions. Travel charges may apply beyond city limits." },
  { q: "How far in advance should I book?", a: "For bridal bookings, we recommend at least 4–6 weeks in advance." },
  { q: "Do you ship henna cones outside Karnataka?", a: "Yes, we ship pan-India. Delivery timelines vary by location." },
];

function SoulconeHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [filter, setFilter] = useState<"all" | "bridal" | "party" | "custom" | "products">("all");
  const [dbReviews, setDbReviews] = useState<
    { name: string; city: string | null; rating: number; review: string }[] | null
  >(null);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("name,city,rating,review")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(9)
      .then(({ data }) => {
        if (data && data.length > 0) setDbReviews(data);
      });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view"));
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const filtered = filter === "all" ? GALLERY : GALLERY.filter((g) => g.cat === filter);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-cream/90 backdrop-blur-md shadow-soft" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#home" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-gold text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-serif text-lg font-semibold text-primary">Soulcone</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-medium text-primary/80 transition-colors hover:text-accent"
              >
                {n.label}
              </a>
            ))}
            <a
              href="#booking"
              className="rounded-full bg-gradient-gold px-5 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:scale-105"
            >
              Book Now
            </a>
          </nav>
          <button
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-cream text-primary md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border/60 bg-cream/95 backdrop-blur md:hidden">
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary/80 hover:bg-beige"
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#booking"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-gradient-gold px-5 py-3 text-center text-sm font-medium text-primary-foreground"
              >
                Book Now
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Bridal mehndi henna artistry"
          width={1600}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brown-deep/60 via-brown-deep/50 to-cream/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-brown-deep/50 to-transparent" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col items-start justify-center px-5 pt-28 pb-20 md:px-8">
          <div className="max-w-2xl animate-fade-up">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-cream/20 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-cream backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Udupi, Karnataka
            </span>
            <h1 className="font-serif text-4xl leading-[1.05] text-cream sm:text-5xl md:text-6xl lg:text-7xl">
              Premium Organic Henna
              <span className="block italic text-gradient-gold">& Mehndi Artistry</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
              Handcrafted, chemical-free henna cones and luxury bridal mehndi — designed to leave
              you with a rich, lasting stain and a story to remember.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#booking"
                className="rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-luxe transition-transform hover:scale-105"
              >
                Book Mehndi
              </a>
              <a
                href="#products"
                className="rounded-full border border-cream/60 bg-cream/10 px-7 py-3.5 text-sm font-semibold text-cream backdrop-blur transition hover:bg-cream/20"
              >
                Order Henna Cones
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section id="why" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Why Choose Soulcone
          </p>
          <h2 className="font-serif text-3xl text-primary sm:text-4xl md:text-5xl">
            Crafted with care, made for you
          </h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="reveal group rounded-2xl border border-border/70 bg-card p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-luxe"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-gold text-primary-foreground shadow-soft">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-serif text-xl text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-gradient-cream">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
          <div className="reveal">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
              About Soulcone
            </p>
            <h2 className="font-serif text-3xl text-primary sm:text-4xl md:text-5xl">
              A story rooted in tradition, refined for today
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Soulcone was born from a love for the ancient art of henna. From our home in Udupi,
              we craft every cone by hand, using organically grown henna leaves and pure essential
              oils — never chemicals, never shortcuts.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our mission is simple: to bring back the deep, natural stain and quiet luxury of
              real mehndi — for brides, for celebrations, and for every hand that wears it.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { k: "500+", v: "Brides Adorned" },
                { k: "100%", v: "Organic" },
                { k: "5★", v: "Client Rating" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-border/70 bg-card p-4 text-center shadow-soft">
                  <div className="font-serif text-2xl text-accent">{s.k}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-gold opacity-20 blur-2xl" />
            <img
              src={gBridal2}
              alt="Bridal mehndi artistry detail"
              width={800}
              height={800}
              loading="lazy"
              className="relative aspect-square w-full rounded-3xl object-cover shadow-luxe"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">Services</p>
          <h2 className="font-serif text-3xl text-primary sm:text-4xl md:text-5xl">
            Artistry for every occasion
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              className="reveal group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-luxe"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  width={800}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <a
                  href="#booking"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent transition hover:gap-3"
                >
                  {s.cta} <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="bg-gradient-cream">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="reveal mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">Gallery</p>
            <h2 className="font-serif text-3xl text-primary sm:text-4xl md:text-5xl">
              A portfolio of intricate detail
            </h2>
          </div>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-2">
            {(["all", "bridal", "party", "custom", "products"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${
                  filter === c
                    ? "bg-gradient-gold text-primary-foreground shadow-soft"
                    : "border border-border/70 bg-card text-primary/80 hover:border-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {filtered.map((g, i) => (
              <div
                key={g.src}
                className="reveal group relative aspect-square overflow-hidden rounded-2xl bg-beige shadow-soft"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  width={800}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brown-deep/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">Products</p>
          <h2 className="font-serif text-3xl text-primary sm:text-4xl md:text-5xl">
            Take Soulcone home
          </h2>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {PRODUCTS.map((p, i) => (
            <div
              key={p.title}
              className="reveal group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft transition hover:shadow-luxe md:flex"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="aspect-square overflow-hidden md:w-1/2">
                <img
                  src={p.img}
                  alt={p.title}
                  width={800}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-7 md:w-1/2 md:p-8">
                <h3 className="font-serif text-2xl text-primary">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-serif text-2xl text-accent">{p.price}</span>
                  <span className="text-xs text-muted-foreground">price on request</span>
                </div>
                <a
                  href="#booking"
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:scale-105"
                >
                  Order Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="reveal mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
              Loved by Our Clients
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">
              Words from our brides & beyond
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {(dbReviews ?? REVIEWS.map((r) => ({ name: r.name, city: null, rating: r.rating, review: r.text }))).map((r, i) => (
              <div
                key={`${r.name}-${i}`}
                className="reveal rounded-2xl border border-cream/10 bg-cream/5 p-7 backdrop-blur"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex gap-1 text-accent">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-cream/90">"{r.review}"</p>
                <p className="mt-5 font-serif text-lg">{r.name}</p>
                {r.city && <p className="text-xs text-cream/60">{r.city}</p>}
              </div>
            ))}
          </div>
          <div className="reveal mx-auto mt-14 max-w-2xl">
            <div className="rounded-3xl border border-cream/10 bg-cream/5 p-7 backdrop-blur md:p-9">
              <h3 className="font-serif text-2xl text-cream">Share your experience</h3>
              <p className="mt-1 text-sm text-cream/70">
                Loved your Soulcone experience? Leave a review — it will appear here once approved.
              </p>
              <form
                className="mt-6 grid gap-4 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  const rating = Number(fd.get("rating") || 5);
                  const { error } = await supabase.from("reviews").insert({
                    name: String(fd.get("name") || "").trim(),
                    city: String(fd.get("city") || "").trim() || null,
                    rating,
                    review: String(fd.get("review") || "").trim(),
                  });
                  if (error) {
                    toast.error(error.message);
                  } else {
                    toast.success("Thank you! Your review will appear after approval.");
                    form.reset();
                  }
                }}
              >
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-cream/80">Name *</span>
                  <input
                    name="name"
                    required
                    className="w-full rounded-xl border border-cream/20 bg-primary/40 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-accent"
                    placeholder="Your name"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-cream/80">City</span>
                  <input
                    name="city"
                    className="w-full rounded-xl border border-cream/20 bg-primary/40 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-accent"
                    placeholder="Your city"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1.5 block font-medium text-cream/80">Rating *</span>
                  <select
                    name="rating"
                    defaultValue="5"
                    required
                    className="w-full rounded-xl border border-cream/20 bg-primary/40 px-4 py-3 text-sm text-cream outline-none focus:border-accent"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n} className="text-foreground">
                        {n} star{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1.5 block font-medium text-cream/80">Your Review *</span>
                  <textarea
                    name="review"
                    required
                    rows={4}
                    placeholder="Tell us about your experience..."
                    className="w-full resize-none rounded-xl border border-cream/20 bg-primary/40 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-accent"
                  />
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">FAQ</p>
          <h2 className="font-serif text-3xl text-primary sm:text-4xl md:text-5xl">
            Questions, answered
          </h2>
        </div>
        <div className="reveal mt-12 divide-y divide-border/70 rounded-2xl border border-border/70 bg-card shadow-soft">
          {FAQS.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="bg-gradient-cream">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="reveal mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
              Bookings & Orders
            </p>
            <h2 className="font-serif text-3xl text-primary sm:text-4xl md:text-5xl">
              Reserve your date or place an order
            </h2>
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <FormCard
              title="Mehndi Booking"
              subtitle="Bridal, party & custom appointments"
              successMessage="Booking request received. We'll confirm shortly!"
              onSubmit={async (fd) => {
                const eventDate = String(fd.get("date") || "");
                const today = new Date().toISOString().slice(0, 10);
                if (eventDate && eventDate < today) return "Event date cannot be in the past.";
                const { error } = await supabase.from("bookings").insert({
                  name: String(fd.get("name") || "").trim(),
                  phone: String(fd.get("phone") || "").trim(),
                  email: String(fd.get("email") || "").trim(),
                  event_type: String(fd.get("eventType") || ""),
                  event_date: eventDate,
                  location: String(fd.get("location") || "").trim(),
                  notes: String(fd.get("notes") || "").trim() || null,
                });
                return error?.message ?? null;
              }}
            >
              <Field label="Full Name" name="name" placeholder="Your name" required />
              <Field label="Phone" name="phone" placeholder="+91 ..." type="tel" required />
              <Field label="Email" name="email" placeholder="you@example.com" type="email" required />
              <SelectField
                label="Event Type"
                name="eventType"
                options={["Bridal", "Engagement", "Sangeet", "Party", "Custom"]}
                required
              />
              <Field
                label="Event Date"
                name="date"
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
              />
              <Field label="Location" name="location" placeholder="City / venue" required />
              <TextArea label="Notes" name="notes" placeholder="Design preferences, timing, etc." />
              <SubmitButton>Request Booking</SubmitButton>
            </FormCard>
            <FormCard
              title="Henna Cone Order"
              subtitle="Freshly rolled, shipped nationwide"
              successMessage="Order placed! We'll contact you soon to confirm."
              onSubmit={async (fd) => {
                const qty = Number(fd.get("qty") || 0);
                if (!qty || qty < 1) return "Please enter a valid quantity.";
                const { error } = await supabase.from("orders").insert({
                  name: String(fd.get("name") || "").trim(),
                  phone: String(fd.get("phone") || "").trim(),
                  email: String(fd.get("email") || "").trim(),
                  product_type: String(fd.get("product") || ""),
                  quantity: qty,
                  address: String(fd.get("address") || "").trim(),
                  notes: String(fd.get("notes") || "").trim() || null,
                });
                return error?.message ?? null;
              }}
            >
              <Field label="Full Name" name="name" placeholder="Your name" required />
              <Field label="Phone" name="phone" placeholder="+91 ..." type="tel" required />
              <Field label="Email" name="email" placeholder="you@example.com" type="email" required />
              <SelectField
                label="Product Type"
                name="product"
                options={["Organic Henna Cone", "Nail Cone", "Bulk / Wholesale"]}
                required
              />
              <Field label="Quantity" name="qty" placeholder="e.g. 10" type="number" required />
              <TextArea label="Delivery Address" name="address" placeholder="Full address with pincode" required />
              <TextArea label="Notes" name="notes" placeholder="Any special instructions" />
              <SubmitButton>Place Order</SubmitButton>
            </FormCard>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="reveal">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">Contact</p>
            <h2 className="font-serif text-3xl text-primary sm:text-4xl md:text-5xl">
              Let's create something beautiful
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Reach out for bookings, custom designs, wholesale orders, or just to say hello.
            </p>
            <ul className="mt-8 space-y-4">
              <ContactRow icon={Instagram} label="Instagram" value="@soulcone.henna" href="https://instagram.com/soulcone.henna" />
              <ContactRow icon={MessageCircle} label="WhatsApp" value="Chat with us" href="https://wa.me/919999999999" />
              <ContactRow icon={Mail} label="Email" value="hello@soulcone.in" href="mailto:hello@soulcone.in" />
              <ContactRow icon={MapPin} label="Location" value="Udupi, Karnataka, India" />
            </ul>
          </div>
          <FormCard
            title="Send a Message"
            subtitle="We'll get back within 24 hours"
            successMessage="Message sent! We'll reply within 24 hours."
            onSubmit={async (fd) => {
              const subject = String(fd.get("subject") || "").trim();
              const body = String(fd.get("message") || "").trim();
              const { error } = await supabase.from("contacts").insert({
                name: String(fd.get("name") || "").trim(),
                email: String(fd.get("email") || "").trim(),
                phone: null,
                message: subject ? `${subject}\n\n${body}` : body,
              });
              return error?.message ?? null;
            }}
          >
            <Field label="Name" name="name" placeholder="Your name" required />
            <Field label="Email" name="email" placeholder="you@example.com" type="email" required />
            <Field label="Subject" name="subject" placeholder="How can we help?" />
            <TextArea label="Message" name="message" placeholder="Tell us more..." required />
            <SubmitButton>Send Message</SubmitButton>
          </FormCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-gold text-primary">
                  <Leaf className="h-5 w-5" />
                </span>
                <span className="font-serif text-2xl">Soulcone</span>
              </div>
              <p className="mt-4 max-w-sm text-sm text-cream/70">
                Premium organic henna and bridal mehndi artistry, handcrafted in Udupi, Karnataka.
              </p>
            </div>
            <div>
              <h4 className="font-serif text-lg">Quick Links</h4>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-cream/70">
                {NAV.map((n) => (
                  <li key={n.href}>
                    <a href={n.href} className="transition hover:text-accent">
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-lg">Follow</h4>
              <div className="mt-4 flex gap-3">
                {[
                  { i: Instagram, h: "https://instagram.com/soulcone.henna", l: "Instagram" },
                  { i: MessageCircle, h: "https://wa.me/919999999999", l: "WhatsApp" },
                  { i: Mail, h: "mailto:hello@soulcone.in", l: "Email" },
                ].map(({ i: I, h, l }) => (
                  <a
                    key={l}
                    href={h}
                    aria-label={l}
                    className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 transition hover:border-accent hover:text-accent"
                  >
                    <I className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-xs text-cream/60 md:flex-row">
            <p>© {new Date().getFullYear()} Soulcone. All rights reserved.</p>
            <p>Handcrafted with care in Udupi, Karnataka.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/919999999999"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-luxe transition-transform hover:scale-110 animate-float"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-24 right-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-luxe transition hover:bg-brown-deep"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="block w-full text-left"
    >
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <span className="font-serif text-lg text-primary">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-accent transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      <div
        className={`grid overflow-hidden px-6 transition-all duration-300 ${
          open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 text-sm leading-relaxed text-muted-foreground">{a}</div>
      </div>
    </button>
  );
}

function FormCard({
  title,
  subtitle,
  children,
  onSubmit,
  successMessage = "Thanks! We'll be in touch soon.",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onSubmit?: (data: FormData, form: HTMLFormElement) => Promise<string | null | void>;
  successMessage?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const handle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!onSubmit) {
      toast.success(successMessage);
      form.reset();
      return;
    }
    setSubmitting(true);
    try {
      const err = await onSubmit(new FormData(form), form);
      if (err) {
        toast.error(err);
      } else {
        toast.success(successMessage);
        form.reset();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form
      className="reveal rounded-3xl border border-border/70 bg-card p-7 shadow-soft md:p-9"
      onSubmit={handle}
    >
      <h3 className="font-serif text-2xl text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <fieldset disabled={submitting} className="contents">
        <div className="mt-6 grid gap-4 sm:grid-cols-2">{children}</div>
      </fieldset>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required,
  min,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string | number;
  defaultValue?: string | number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-primary/80">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        min={min}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-primary/80">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <select
        name={name}
        required={required}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm sm:col-span-2">
      <span className="mb-1.5 block font-medium text-primary/80">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={4}
        required={required}
        className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="sm:col-span-2">
      <button
        type="submit"
        className="w-full rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
      >
        {children}
      </button>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const Inner = (
    <div className="flex items-center gap-4">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-gold text-primary-foreground shadow-soft">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-medium text-primary">{value}</div>
      </div>
    </div>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="block transition hover:opacity-80" target="_blank" rel="noreferrer">
          {Inner}
        </a>
      ) : (
        Inner
      )}
    </li>
  );
}
