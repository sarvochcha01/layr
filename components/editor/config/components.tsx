import { 
  Search, Star, LayoutTemplate, Navigation, SplitSquareVertical, 
  Square, Box, Grid3X3, Target, CreditCard, Type, Pointer, 
  Image as ImageIcon, Video, FileText, ListCollapse, FolderTree, 
  MessageSquare, DollarSign, Sparkles, BarChart, 
  Megaphone, Minus, ArrowUpDown, Tag, AlertCircle 
} from "lucide-react";

export interface ComponentItem {
  type: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export interface ComponentCategory {
  name: string;
  components: ComponentItem[];
}

export const componentCategories: ComponentCategory[] = [
  {
    name: "Layout",
    components: [
      {
        type: "Header",
        name: "Header",
        icon: <LayoutTemplate className="w-5 h-5" />,
        description: "Page header with navigation",
      },
      {
        type: "Navbar",
        name: "Navbar",
        icon: <Navigation className="w-5 h-5" />,
        description: "Navigation bar with menu items",
      },
      {
        type: "Footer",
        name: "Footer",
        icon: <SplitSquareVertical className="w-5 h-5" />,
        description: "Page footer with links",
      },
      {
        type: "Section",
        name: "Section",
        icon: <Square className="w-5 h-5" />,
        description: "Content section container",
      },
      {
        type: "Container",
        name: "Container",
        icon: <Box className="w-5 h-5" />,
        description: "Responsive container",
      },
      {
        type: "Grid",
        name: "Grid",
        icon: <Grid3X3 className="w-5 h-5" />,
        description: "Responsive grid layout",
      },
    ],
  },
  {
    name: "Content",
    components: [
      {
        type: "Hero",
        name: "Hero",
        icon: <Target className="w-5 h-5" />,
        description: "Hero section with CTA",
      },
      {
        type: "Card",
        name: "Card",
        icon: <CreditCard className="w-5 h-5" />,
        description: "Content card with image",
      },
      {
        type: "Text",
        name: "Text",
        icon: <Type className="w-5 h-5" />,
        description: "Text content block",
      },
      {
        type: "Button",
        name: "Button",
        icon: <Pointer className="w-5 h-5" />,
        description: "Call-to-action button",
      },
    ],
  },
  {
    name: "Media",
    components: [
      {
        type: "Image",
        name: "Image",
        icon: <ImageIcon className="w-5 h-5" />,
        description: "Responsive image",
      },
      {
        type: "Video",
        name: "Video",
        icon: <Video className="w-5 h-5" />,
        description: "Video player or embed",
      },
    ],
  },
  {
    name: "Forms",
    components: [
      {
        type: "Form",
        name: "Form",
        icon: <FileText className="w-5 h-5" />,
        description: "Contact or signup form",
      },
    ],
  },
  {
    name: "Interactive",
    components: [
      {
        type: "Accordion",
        name: "Accordion",
        icon: <ListCollapse className="w-5 h-5" />,
        description: "Collapsible content sections",
      },
      {
        type: "Tabs",
        name: "Tabs",
        icon: <FolderTree className="w-5 h-5" />,
        description: "Tabbed content switcher",
      },
    ],
  },
  {
    name: "Marketing",
    components: [
      {
        type: "Testimonial",
        name: "Testimonial",
        icon: <MessageSquare className="w-5 h-5" />,
        description: "Customer review with rating",
      },
      {
        type: "PricingCard",
        name: "Pricing Card",
        icon: <DollarSign className="w-5 h-5" />,
        description: "Pricing plan with features",
      },
      {
        type: "Feature",
        name: "Feature",
        icon: <Sparkles className="w-5 h-5" />,
        description: "Feature showcase with icon",
      },
      {
        type: "Stats",
        name: "Stats",
        icon: <BarChart className="w-5 h-5" />,
        description: "Statistics and numbers",
      },
      {
        type: "CTA",
        name: "CTA",
        icon: <Megaphone className="w-5 h-5" />,
        description: "Call-to-action section",
      },
    ],
  },
  {
    name: "UI Elements",
    components: [
      {
        type: "Divider",
        name: "Divider",
        icon: <Minus className="w-5 h-5" />,
        description: "Visual separator line",
      },
      {
        type: "Spacer",
        name: "Spacer",
        icon: <ArrowUpDown className="w-5 h-5" />,
        description: "Vertical spacing",
      },
      {
        type: "Badge",
        name: "Badge",
        icon: <Tag className="w-5 h-5" />,
        description: "Small label or tag",
      },
      {
        type: "Alert",
        name: "Alert",
        icon: <AlertCircle className="w-5 h-5" />,
        description: "Notification message",
      },
    ],
  },
];
