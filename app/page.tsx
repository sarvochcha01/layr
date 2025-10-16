"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Move, LayoutTemplate, Download, Github, X } from "lucide-react";

// Updated Logo component to better match the design (circle with letter)
const Logo = () => (
  <Link href="/" className="flex items-center space-x-3">
    <div className="w-7 h-7 bg-foreground rounded-full flex items-center justify-center">
      <span className="font-bold text-sm text-background">L</span>
    </div>
    <span className="font-bold text-lg text-foreground">Layr</span>
  </Link>
);

export default function Home() {
  const features = [
    {
      icon: <Move className="w-8 h-8 text-primary" />,
      title: "Intuitive Drag & Drop Editor",
      description:
        "Visually design and structure your pages with a seamless, intuitive interface. No coding required.",
    },
    {
      icon: <LayoutTemplate className="w-8 h-8 text-primary" />,
      title: "Beautiful Templates",
      description:
        "Start your project with a variety of professionally designed templates to speed up your workflow.",
    },
    {
      icon: <Download className="w-8 h-8 text-primary" />,
      title: "One-Click Export & Host",
      description:
        "Download your complete static site as clean HTML/CSS or host it anywhere with a single click.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="w-full">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <Button asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-28 lg:py-32">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Build Static Websites
              <br />
              {/* This is the key to the "Effortlessly" effect */}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Effortlessly
                </span>
                {/* The glowing background effect */}
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 -z-10 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent opacity-30 blur-2xl"
                >
                  Effortlessly
                </span>
              </span>
            </h1>

            <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground">
              Layr lets you drag, drop, and design beautiful static websites
              without writing a single line of code. Export clean HTML and host
              anywhere.
            </p>

            <div className="mt-8 flex justify-center items-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Start Building Now</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Everything You Need, Nothing You Don't
              </h2>
              <p className="mt-4 text-muted-foreground">
                Layr provides the perfect toolset for creators, marketers, and
                developers.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-8 bg-card border rounded-xl text-center flex flex-col items-center shadow-sm"
                >
                  <div className="p-4 bg-muted rounded-full mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="flex gap-4">
            {/* CORRECTED: Using X icon */}
            <Link
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Layr Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
