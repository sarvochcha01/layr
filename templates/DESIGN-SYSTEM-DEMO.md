# Design System Demo Template

A comprehensive showcase template that demonstrates every component in the builder with multiple configurations and real-world usage examples.

## Purpose

This template serves as:

- **Export Testing** - Validates that all components export correctly with various property configurations
- **Component Reference** - Shows all available components and their capabilities
- **Layout Examples** - Demonstrates different flexbox configurations and overflow handling
- **Design Inspiration** - Provides a cohesive design system example

## Pages (4 Total)

### 1. Home Page (`/`)

**Components Used:**

- Navbar (with custom colors and link styling)
- Hero Container (flex column, centered, with gradient background)
- Badge (success variant, large size)
- Heading (H1, large font)
- Text (centered, max-width)
- Buttons (primary and secondary variants, different sizes)
- Alert (all 4 types: success, info, warning, error)
- Stats (horizontal layout, 4 metrics)
- Divider
- Feature (4 features with icons and colors)
- Spacer
- Testimonial (3 testimonials with avatars and ratings)
- CTA (call-to-action section)
- Footer

**Tests:**

- Container with flex column, center alignment
- Multiple button variants and sizes
- All alert types
- Feature grid with wrap
- Testimonial layout

### 2. Components Page (`/components`)

**Components Used:**

- Navbar (consistent across pages)
- Hero section
- Badge showcase (all variants: primary, success, warning, error, info in different sizes)
- Button showcase (small, medium, large, primary, secondary, outline, rounded)
- Card showcase (with image, simple, colored with custom backgrounds)
- Accordion (4 items, single selection)
- Tabs (4 tabs with different content)
- Divider
- Image (3 images with different border radius: 8px, 16px, 50%)
- Footer

**Tests:**

- Badge variants and sizes
- Button variants, sizes, and custom styling
- Card with/without images, custom colors
- Accordion functionality
- Tabs with multiple panels
- Image object-fit and border-radius

### 3. Layouts Page (`/layouts`)

**Components Used:**

- Navbar
- Hero section
- **Layout 1**: Horizontal flex with space-between (3 cards)
- **Layout 2**: Vertical flex with center alignment (3 features, min-height)
- **Layout 3**: Wrapped grid with flex-start (8 badges, technology stack)
- **Layout 4**: Vertical scroll container (overflow-y: auto, max-height, 5 cards)
- **Layout 5**: Horizontal scroll container (overflow-x: auto, 5 cards with images)
- Spacers (different heights: 40px, 60px)
- Footer

**Tests:**

- Flex direction: row and column
- Justify content: space-between, center, flex-start
- Align items: center, flex-start, stretch
- Flex wrap: wrap and nowrap
- Overflow: auto on both X and Y axes
- Gap spacing
- Min/max height constraints

### 4. Pricing Page (`/pricing`)

**Components Used:**

- Navbar
- Hero with badge
- PricingCard (3 tiers: Starter, Professional, Enterprise)
  - Different feature counts
  - Highlighted middle card
  - String array features
- Divider
- Stats (4 metrics, transparent background)
- Accordion (6 FAQ items, multiple selection allowed)
- CTA
- Footer

**Tests:**

- PricingCard with different feature counts
- Highlighted vs non-highlighted cards
- Accordion with allowMultiple: true
- Stats with transparent background
- Container with max-width constraint

## Component Coverage

### All Components Used:

✅ Navbar (4 instances with link styling)
✅ Container (20+ instances with various flex configurations)
✅ Text (used for headings and content with various sizes and alignments)
✅ Button (10+ instances: all variants, sizes, custom styling)
✅ Badge (10+ instances: all variants and sizes)
✅ Card (9 instances: with/without images, custom colors)
✅ Image (6 instances: different sizes and border-radius)
✅ Feature (7 instances with icons and colors)
✅ Stats (2 instances: different backgrounds)
✅ Testimonial (3 instances with avatars)
✅ PricingCard (3 instances: different tiers)
✅ Accordion (2 instances: single and multiple selection)
✅ Tabs (1 instance with 4 tabs)
✅ Alert (4 instances: all types)
✅ CTA (2 instances: different colors)
✅ Divider (3 instances: different thickness)
✅ Spacer (6 instances: different heights)
✅ Footer (4 instances: consistent styling)

## Property Variations Tested

### Container Properties:

- `display`: flex
- `flexDirection`: row, column
- `flexWrap`: wrap, nowrap
- `justifyContent`: center, space-between, flex-start
- `alignItems`: center, flex-start, stretch
- `gap`: 15px, 20px, 25px, 30px, 50px
- `overflowX`: auto, hidden
- `overflowY`: auto, hidden
- `minHeight`: 400px, 500px
- `maxHeight`: 400px
- `maxWidth`: 600px, 700px, 800px, 1200px
- `backgroundColor`: various colors
- `padding`: various values
- `borderWidth`, `borderColor`, `borderRadius`

### Button Properties:

- `variant`: primary, secondary, outline
- `size`: small, medium, large
- `backgroundColor`: custom colors
- `textColor`: custom colors
- `borderWidth`, `borderColor`
- `borderRadius`: default and 50px (rounded)
- `linkType`: page, external
- `linkPage`: various pages

### Badge Properties:

- `variant`: primary, success, warning, error, info
- `size`: small, medium, large

### Card Properties:

- `imageUrl`: with and without
- `padding`: 0, 20px, 30px
- `backgroundColor`: default, custom colors
- `textColor`: default, white
- `borderRadius`: 8px, 12px, 16px
- `boxShadow`: various values

### Image Properties:

- `width`, `height`: various sizes
- `borderRadius`: 8px, 16px, 50% (circle)
- `objectFit`: cover

## Design Coherence

The template maintains a cohesive design through:

- **Color Scheme**: Dark navy (#1a1a2e, #0f3460), teal accent (#16c79a), complementary colors
- **Typography**: Consistent font sizes and hierarchy
- **Spacing**: Uniform padding and gaps
- **Visual Flow**: Logical progression from hero to features to testimonials to CTA
- **Professional Content**: Realistic text and descriptions
- **Consistent Navigation**: Same navbar across all pages

## Use Cases

1. **Export Validation**: Test that all components render correctly in exported HTML
2. **Property Testing**: Verify all component properties work as expected
3. **Layout Testing**: Ensure flexbox configurations export properly
4. **Overflow Testing**: Validate scroll behavior in exported files
5. **Multi-page Testing**: Confirm navigation works between pages
6. **Style Testing**: Check that inline styles are applied correctly
7. **Component Reference**: Use as documentation for available components

## Export Expectations

When exported, this template should:

- Generate 4 HTML files (index.html, components.html, layouts.html, pricing.html)
- Include working navigation between pages
- Render all components with correct styling
- Handle overflow scrolling properly
- Display all images correctly
- Apply all custom colors and sizes
- Maintain responsive layout
