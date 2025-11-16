// Import components for registry
import { Header } from './Header';
import { Footer } from './Footer';
import { Section } from './Section';
import { Container } from './Container';
import { Grid } from './Grid';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Card } from './Card';
import { Text } from './Text';
import { Image } from './Image';
import { Video } from './Video';
import { Button } from './Button';
import { Form } from './Form';
import { Accordion } from './Accordion';
import { Tabs } from './Tabs';
import { Testimonial } from './Testimonial';
import { PricingCard } from './PricingCard';
import { Feature } from './Feature';
import { Stats } from './Stats';
import { CTA } from './CTA';
import { Divider } from './Divider';
import { Spacer } from './Spacer';
import { Badge } from './Badge';
import { Alert } from './Alert';

// Layout Components
export { Header } from './Header';
export { Footer } from './Footer';
export { Section } from './Section';
export { Container } from './Container';
export { Grid } from './Grid';

// Navigation Components
export { Navbar } from './Navbar';

// Content Components
export { Hero } from './Hero';
export { Card } from './Card';
export { Text } from './Text';

// Media Components
export { Image } from './Image';
export { Video } from './Video';

// Interactive Components
export { Button } from './Button';
export { Form } from './Form';
export { Accordion } from './Accordion';
export { Tabs } from './Tabs';

// Marketing Components
export { Testimonial } from './Testimonial';
export { PricingCard } from './PricingCard';
export { Feature } from './Feature';
export { Stats } from './Stats';
export { CTA } from './CTA';

// UI Components
export { Divider } from './Divider';
export { Spacer } from './Spacer';
export { Badge } from './Badge';
export { Alert } from './Alert';

// Component Registry for dynamic rendering
export const COMPONENT_REGISTRY = {
    Header,
    Footer,
    Section,
    Container,
    Grid,
    Navbar,
    Hero,
    Card,
    Text,
    Image,
    Video,
    Button,
    Form,
    Accordion,
    Tabs,
    Testimonial,
    PricingCard,
    Feature,
    Stats,
    CTA,
    Divider,
    Spacer,
    Badge,
    Alert,
} as const;

export type ComponentType = keyof typeof COMPONENT_REGISTRY;