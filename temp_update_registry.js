const fs = require('fs');
let code = fs.readFileSync('components/editor/properties/registry.ts', 'utf8');

const themeSection = `      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Standard", value: "standard" },
              { label: "Centered", value: "centered" },
              { label: "Minimal", value: "minimal" },
              { label: "Brand Focus", value: "brand-focus" },
              { label: "Magazine", value: "magazine" },
              { label: "Brutalist", value: "brutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Split Dark", value: "split-dark" },
              { label: "Startup", value: "startup" },
              { label: "Newsletter", value: "newsletter" },
            ],
          },
        ],
      },`;

// We inject it right before `    styleSections: [...]` for all schemas EXCEPT Button
// because Button already has it. Also skip Footer for now since Footer uses variant.

const components = ['Hero', 'Text', 'Image', 'Card', 'Navbar', 'Header', 'Container', 'Grid', 'Section', 'Video', 'Form', 'Accordion', 'Tabs', 'Testimonial', 'PricingCard', 'Feature', 'Stats', 'CTA', 'Divider', 'Spacer', 'Badge', 'Alert', 'CustomCode'];

for (const comp of components) {
    const regex = new RegExp(`(  ${comp}: {\\s*sections: \\[\n?)([\\s\\S]*?)(\n    \\],\\s*styleSections)`, 'g');
    code = code.replace(regex, (match, p1, p2, p3) => {
        return p1 + p2 + '\n' + themeSection + p3;
    });
}

fs.writeFileSync('components/editor/properties/registry.ts', code);
console.log('done');
