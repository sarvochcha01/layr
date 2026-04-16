const fs = require('fs');
const path = require('path');

const dir = 'components/builder';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'Footer.tsx' && f !== 'Button.tsx' && f !== 'Container.tsx' && f !== 'Section.tsx');

const importsToAdd = `import { ThemeStyleVariant, getThemeClasses, getThemeStyles } from "@/lib/themeStyles";\nimport { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";`;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('useEffectiveThemeStyle')) {
    console.log(`Skipping ${file} - already has theme code`);
    continue;
  }

  // 1. Add imports after last import
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfLastImport = content.indexOf('\n', lastImportIndex) + 1;
    content = content.slice(0, endOfLastImport) + importsToAdd + '\n' + content.slice(endOfLastImport);
  }

  // 2. Add themeStyle to Props interface
  content = content.replace(/(\[key: string\]: any;\s*})/, 'themeStyle?: ThemeStyleVariant;\n  $1');

  // 3. Destructure themeStyle in component signature
  // We need to find `...rest` and insert before it
  content = content.replace(/(\s+)(\.\.\.rest\s*}:)/, '$1themeStyle,$1$2');

  // 4. Add hook calls after baseStyle
  const hookCalls = `
  const effectiveTheme = useEffectiveThemeStyle(themeStyle);
  const themeClasses = getThemeClasses(effectiveTheme);
  const themeInlineStyles = getThemeStyles(effectiveTheme);
`;
  content = content.replace(/(const baseStyle = buildComponentStyle\([^)]+\);)/, '$1' + hookCalls);

  // If there's a custom style variable being computed like gridStyle, let's inject themeInlineStyles safely.
  // Actually, we can just replace `style={baseStyle}` or `style={gridStyle}` or `style={something}` in the return block with spreading
  // Let's do string replacement for the first className={cn( and style={
  
  // 5. Inject themeClasses into the first className={cn(
  content = content.replace(/className=\{cn\(/, 'className={cn(\n        themeClasses.border,\n        themeClasses.corners,\n        themeClasses.shadow,\n        themeClasses.font,\n        themeClasses.transition,');

  // 6. Inject themeInlineStyles into the first style={
  // This is tricky. It could be style={baseStyle} or style={gridStyle} or style={{ color: xyz }}
  // Let's find the first `style={something}` after the first `className={cn(`
  // We'll use a regex replacer function
  let replacedStyle = false;
  content = content.replace(/style=\{([^}]+)\}/g, (match, p1) => {
    if (replacedStyle) return match;
    // If it's an object literal like style={{ ...baseStyle, foo: bar }}
    if (p1.startsWith('{') && p1.endsWith('}')) {
      const inner = p1.substring(1, p1.length - 1);
      replacedStyle = true;
      return `style={{ ...themeInlineStyles, ${inner} }}`;
    } else {
      // If it's a variable like style={baseStyle}
      replacedStyle = true;
      return `style={{ ...${p1}, ...themeInlineStyles }}`;
    }
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
