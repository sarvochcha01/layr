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
} as const;

export type ComponentType = keyof typeof COMPONENT_REGISTRY;