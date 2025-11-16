// Script to seed initial templates to Firestore
// Run with: npx tsx scripts/seedTemplates.ts

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from "firebase/firestore";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local or .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

console.log("✓ Environment variables loaded\n");

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("❌ Firebase configuration is incomplete!");
    console.log("\nMissing variables:");
    if (!firebaseConfig.apiKey) console.log("  - NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!firebaseConfig.authDomain) console.log("  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    if (!firebaseConfig.projectId) console.log("  - NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    if (!firebaseConfig.storageBucket) console.log("  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
    if (!firebaseConfig.messagingSenderId) console.log("  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
    if (!firebaseConfig.appId) console.log("  - NEXT_PUBLIC_FIREBASE_APP_ID");
    console.log("\nPlease check your .env file has all required Firebase variables.");
    process.exit(1);
}

console.log("✓ Firebase config loaded successfully");
console.log(`✓ Project ID: ${firebaseConfig.projectId}\n`);

// Initialize Firebase for the script
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const templates = [
    {
        name: "E-commerce Store",
        description: "Complete online store with product showcase and shopping features",
        category: "E-commerce",
        thumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400",
        featured: true,
        components: [
            {
                id: "nav-1",
                type: "Navbar",
                props: {
                    logoText: "ShopName",
                    links: [
                        { text: "Products", href: "#products" },
                        { text: "About", href: "#about" },
                        { text: "Contact", href: "#contact" },
                    ],
                    ctaText: "Cart (0)",
                    ctaLink: "#cart",
                    backgroundColor: "#ffffff",
                    textColor: "#000000",
                },
                children: [],
            },
            {
                id: "hero-1",
                type: "Hero",
                props: {
                    title: "Welcome to Our Store",
                    subtitle: "Premium Quality Products",
                    description: "Discover our curated collection of amazing products",
                    primaryButtonText: "Shop Now",
                    backgroundColor: "#f8fafc",
                    textColor: "#000000",
                },
                children: [],
            },
            {
                id: "container-1",
                type: "Container",
                props: {
                    padding: "lg",
                    maxWidth: "xl",
                    display: "flex",
                    flexDirection: "column",
                    gap: "lg",
                },
                children: [
                    {
                        id: "stats-1",
                        type: "Stats",
                        props: {
                            stats: [
                                { value: "10K+", label: "Happy Customers" },
                                { value: "500+", label: "Products" },
                                { value: "50+", label: "Categories" },
                                { value: "24/7", label: "Support" },
                            ],
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
                        },
                        children: [],
                    },
                ],
            },
            {
                id: "footer-1",
                type: "Footer",
                props: {
                    logoText: "ShopName",
                    copyright: "© 2024 ShopName. All rights reserved.",
                    backgroundColor: "#1f2937",
                    textColor: "#ffffff",
                },
                children: [],
            },
        ],
    },
    {
        name: "Landing Page Pro",
        description: "High-converting landing page for products and services",
        category: "Landing Page",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
        featured: true,
        components: [
            {
                id: "nav-1",
                type: "Navbar",
                props: {
                    logoText: "StartupName",
                    links: [
                        { text: "Features", href: "#features" },
                        { text: "Pricing", href: "#pricing" },
                        { text: "About", href: "#about" },
                    ],
                    ctaText: "Get Started",
                    ctaLink: "#signup",
                    backgroundColor: "#ffffff",
                    textColor: "#000000",
                },
                children: [],
            },
            {
                id: "hero-1",
                type: "Hero",
                props: {
                    title: "Build Something Amazing",
                    subtitle: "The Future is Now",
                    description: "Transform your ideas into reality with our powerful platform",
                    primaryButtonText: "Start Free Trial",
                    backgroundColor: "#3b82f6",
                    textColor: "#ffffff",
                },
                children: [],
            },
            {
                id: "container-1",
                type: "Container",
                props: {
                    padding: "xl",
                    maxWidth: "xl",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: "lg",
                    justifyContent: "center",
                },
                children: [
                    {
                        id: "feature-1",
                        type: "Feature",
                        props: {
                            icon: "⚡",
                            title: "Lightning Fast",
                            description: "Optimized for speed and performance",
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
                        },
                        children: [],
                    },
                    {
                        id: "feature-2",
                        type: "Feature",
                        props: {
                            icon: "🔒",
                            title: "Secure",
                            description: "Enterprise-grade security built-in",
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
                        },
                        children: [],
                    },
                    {
                        id: "feature-3",
                        type: "Feature",
                        props: {
                            icon: "🎨",
                            title: "Customizable",
                            description: "Make it yours with endless options",
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
                        },
                        children: [],
                    },
                ],
            },
            {
                id: "cta-1",
                type: "CTA",
                props: {
                    title: "Ready to Get Started?",
                    description: "Join thousands of satisfied customers today",
                    buttonText: "Sign Up Now",
                    buttonLink: "#signup",
                    backgroundColor: "#1f2937",
                    textColor: "#ffffff",
                },
                children: [],
            },
        ],
    },
    {
        name: "Portfolio Showcase",
        description: "Modern portfolio to showcase your work and skills",
        category: "Portfolio",
        thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400",
        featured: true,
        components: [
            {
                id: "nav-1",
                type: "Navbar",
                props: {
                    logoText: "John Doe",
                    links: [
                        { text: "Work", href: "#work" },
                        { text: "About", href: "#about" },
                        { text: "Contact", href: "#contact" },
                    ],
                    ctaText: "Hire Me",
                    ctaLink: "#contact",
                    backgroundColor: "#ffffff",
                    textColor: "#000000",
                },
                children: [],
            },
            {
                id: "hero-1",
                type: "Hero",
                props: {
                    title: "Creative Designer & Developer",
                    subtitle: "Hi, I'm John Doe",
                    description: "I create beautiful digital experiences that make people's lives easier",
                    primaryButtonText: "View My Work",
                    backgroundColor: "#f8fafc",
                    textColor: "#000000",
                },
                children: [],
            },
            {
                id: "container-1",
                type: "Container",
                props: {
                    padding: "xl",
                    maxWidth: "xl",
                },
                children: [
                    {
                        id: "testimonial-1",
                        type: "Testimonial",
                        props: {
                            quote: "John delivered exceptional work. Highly recommended!",
                            author: "Jane Smith",
                            role: "CEO, TechCorp",
                            rating: 5,
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
                        },
                        children: [],
                    },
                ],
            },
        ],
    },
    {
        name: "Restaurant Menu",
        description: "Elegant restaurant website with menu and reservations",
        category: "Restaurant",
        thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
        featured: false,
        components: [
            {
                id: "nav-1",
                type: "Navbar",
                props: {
                    logoText: "Restaurant Name",
                    links: [
                        { text: "Menu", href: "#menu" },
                        { text: "About", href: "#about" },
                        { text: "Reservations", href: "#reservations" },
                    ],
                    ctaText: "Order Online",
                    ctaLink: "#order",
                    backgroundColor: "#1f2937",
                    textColor: "#ffffff",
                },
                children: [],
            },
            {
                id: "hero-1",
                type: "Hero",
                props: {
                    title: "Fine Dining Experience",
                    subtitle: "Welcome to Restaurant Name",
                    description: "Authentic cuisine crafted with passion and the finest ingredients",
                    primaryButtonText: "View Menu",
                    backgroundColor: "#1f2937",
                    textColor: "#ffffff",
                },
                children: [],
            },
            {
                id: "container-1",
                type: "Container",
                props: {
                    padding: "xl",
                    maxWidth: "xl",
                    display: "flex",
                    flexDirection: "column",
                    gap: "lg",
                },
                children: [
                    {
                        id: "card-1",
                        type: "Card",
                        props: {
                            title: "Signature Dishes",
                            description: "Try our chef's special creations",
                            buttonText: "See Menu",
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
                        },
                        children: [],
                    },
                ],
            },
        ],
    },
    {
        name: "SaaS Product",
        description: "Professional SaaS product landing page with pricing",
        category: "SaaS",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        featured: true,
        components: [
            {
                id: "nav-1",
                type: "Navbar",
                props: {
                    logoText: "SaaSApp",
                    links: [
                        { text: "Features", href: "#features" },
                        { text: "Pricing", href: "#pricing" },
                        { text: "Docs", href: "#docs" },
                    ],
                    ctaText: "Start Free",
                    ctaLink: "#signup",
                    backgroundColor: "#ffffff",
                    textColor: "#000000",
                },
                children: [],
            },
            {
                id: "hero-1",
                type: "Hero",
                props: {
                    title: "Streamline Your Workflow",
                    subtitle: "All-in-One Solution",
                    description: "Powerful tools to help your team collaborate and succeed",
                    primaryButtonText: "Get Started Free",
                    backgroundColor: "#6366f1",
                    textColor: "#ffffff",
                },
                children: [],
            },
            {
                id: "container-1",
                type: "Container",
                props: {
                    padding: "xl",
                    maxWidth: "xl",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: "lg",
                    justifyContent: "center",
                },
                children: [
                    {
                        id: "pricing-1",
                        type: "PricingCard",
                        props: {
                            title: "Starter",
                            price: "$9",
                            period: "/month",
                            description: "Perfect for individuals",
                            features: ["5 Projects", "10GB Storage", "Email Support"],
                            buttonText: "Get Started",
                            featured: false,
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
                        },
                        children: [],
                    },
                    {
                        id: "pricing-2",
                        type: "PricingCard",
                        props: {
                            title: "Pro",
                            price: "$29",
                            period: "/month",
                            description: "Best for teams",
                            features: ["Unlimited Projects", "100GB Storage", "Priority Support", "Advanced Analytics"],
                            buttonText: "Get Started",
                            featured: true,
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
                        },
                        children: [],
                    },
                    {
                        id: "pricing-3",
                        type: "PricingCard",
                        props: {
                            title: "Enterprise",
                            price: "$99",
                            period: "/month",
                            description: "For large organizations",
                            features: ["Unlimited Everything", "1TB Storage", "24/7 Support", "Custom Integration"],
                            buttonText: "Contact Sales",
                            featured: false,
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
                        },
                        children: [],
                    },
                ],
            },
        ],
    },
    {
        name: "Blog & Content",
        description: "Clean blog layout for content creators and writers",
        category: "Blog",
        thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400",
        featured: false,
        components: [
            {
                id: "nav-1",
                type: "Navbar",
                props: {
                    logoText: "My Blog",
                    links: [
                        { text: "Home", href: "#home" },
                        { text: "Articles", href: "#articles" },
                        { text: "About", href: "#about" },
                    ],
                    ctaText: "Subscribe",
                    ctaLink: "#subscribe",
                    backgroundColor: "#ffffff",
                    textColor: "#000000",
                },
                children: [],
            },
            {
                id: "hero-1",
                type: "Hero",
                props: {
                    title: "Stories & Insights",
                    subtitle: "Welcome to My Blog",
                    description: "Thoughts, tutorials, and insights on web development and design",
                    primaryButtonText: "Read Latest",
                    backgroundColor: "#f8fafc",
                    textColor: "#000000",
                },
                children: [],
            },
            {
                id: "container-1",
                type: "Container",
                props: {
                    padding: "xl",
                    maxWidth: "xl",
                },
                children: [
                    {
                        id: "alert-1",
                        type: "Alert",
                        props: {
                            title: "New Article",
                            message: "Check out our latest post on modern web development",
                            variant: "info",
                            dismissible: true,
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
                        },
                        children: [],
                    },
                ],
            },
        ],
    },
];

async function seedTemplates() {
    console.log("Starting to seed templates...\n");

    try {
        const templatesRef = collection(db, "templates");

        // First, clear all existing templates
        console.log("🗑️  Clearing existing templates...");
        const existingTemplates = await getDocs(templatesRef);

        let deletedCount = 0;
        for (const docSnapshot of existingTemplates.docs) {
            await deleteDoc(doc(db, "templates", docSnapshot.id));
            deletedCount++;
        }

        if (deletedCount > 0) {
            console.log(`✓ Deleted ${deletedCount} existing template(s)\n`);
        } else {
            console.log("✓ No existing templates to delete\n");
        }

        // Now add the new templates
        console.log("📝 Adding new templates...");
        for (const template of templates) {
            const docRef = await addDoc(templatesRef, {
                ...template,
                createdAt: serverTimestamp(),
            });
            console.log(`✓ Created template: ${template.name} (${docRef.id})`);
        }

        console.log("\n✅ All templates seeded successfully!");
        console.log(`📊 Total templates: ${templates.length}`);
    } catch (error) {
        console.error("❌ Error seeding templates:", error);
    }
}

seedTemplates();
