import React from "react";

/**
 * Ensures a CSS value has a unit. If the value is a bare number (e.g. "20"),
 * appends "px". Leaves values with existing units (e.g. "2rem", "50%") untouched.
 */
function ensureUnit(value: any): string | undefined {
    if (value == null || value === "") return undefined;
    const str = String(value).trim();
    if (!str) return undefined;
    // If it's purely numeric, append px
    if (/^-?\d+(\.\d+)?$/.test(str)) return `${str}px`;
    return str;
}

/**
 * Maps common style props from component definitions to a React CSSProperties object.
 * All builder components should spread this into their root element's style.
 */
export function buildComponentStyle(props: Record<string, any>): React.CSSProperties {
    const style: React.CSSProperties = {};

    // --- Dimensions ---
    if (props.width) style.width = props.width;
    if (props.height) style.height = props.height;
    if (props.minWidth) style.minWidth = props.minWidth;
    if (props.minHeight) style.minHeight = props.minHeight;
    if (props.maxWidth_css) style.maxWidth = props.maxWidth_css;
    if (props.maxHeight) style.maxHeight = props.maxHeight;

    // --- Spacing (auto-append px for bare numbers) ---
    if (props.paddingTop) style.paddingTop = ensureUnit(props.paddingTop);
    if (props.paddingRight) style.paddingRight = ensureUnit(props.paddingRight);
    if (props.paddingBottom) style.paddingBottom = ensureUnit(props.paddingBottom);
    if (props.paddingLeft) style.paddingLeft = ensureUnit(props.paddingLeft);
    if (props.marginTop) style.marginTop = ensureUnit(props.marginTop);
    if (props.marginRight) style.marginRight = ensureUnit(props.marginRight);
    if (props.marginBottom) style.marginBottom = ensureUnit(props.marginBottom);
    if (props.marginLeft) style.marginLeft = ensureUnit(props.marginLeft);

    // --- Background ---
    if (props.backgroundColor) style.backgroundColor = props.backgroundColor;
    if (props.backgroundType === "gradient" && props.backgroundGradient) {
        style.backgroundImage = props.backgroundGradient;
        style.backgroundColor = undefined;
    } else if (props.backgroundType === "image" && props.backgroundImageUrl) {
        style.backgroundImage = `url(${props.backgroundImageUrl})`;
        style.backgroundSize = props.backgroundSize || "cover";
        style.backgroundPosition = props.backgroundPosition || "center";
        style.backgroundRepeat = props.backgroundRepeat || "no-repeat";
        style.backgroundColor = undefined;
    }

    // --- Typography ---
    if (props.textColor) style.color = props.textColor;
    if (props.fontSize_css) style.fontSize = ensureUnit(props.fontSize_css);
    if (props.fontWeight_css) style.fontWeight = props.fontWeight_css;
    if (props.lineHeight_css) style.lineHeight = props.lineHeight_css;
    if (props.letterSpacing_css) style.letterSpacing = ensureUnit(props.letterSpacing_css);
    if (props.textAlign_css) style.textAlign = props.textAlign_css as any;

    // --- Borders ---
    if (props.borderRadius_css) style.borderRadius = ensureUnit(props.borderRadius_css);
    if (props.borderWidth_css) style.borderWidth = ensureUnit(props.borderWidth_css);
    if (props.borderColor) style.borderColor = props.borderColor;
    if (props.borderStyle_css) style.borderStyle = props.borderStyle_css as any;

    // --- Effects ---
    if (props.opacity_css != null && props.opacity_css !== "" && props.opacity_css !== 1) {
        style.opacity = Number(props.opacity_css);
    }
    if (props.boxShadow) style.boxShadow = props.boxShadow;

    // --- Position ---
    if (props.position_css && props.position_css !== "static") {
        style.position = props.position_css as any;
        if (props.posTop) style.top = ensureUnit(props.posTop);
        if (props.posRight) style.right = ensureUnit(props.posRight);
        if (props.posBottom) style.bottom = ensureUnit(props.posBottom);
        if (props.posLeft) style.left = ensureUnit(props.posLeft);
    }
    if (props.zIndex) style.zIndex = Number(props.zIndex);

    // --- Overflow ---
    if (props.overflowX_css && props.overflowX_css !== "visible") {
        style.overflowX = props.overflowX_css as any;
    }
    if (props.overflowY_css && props.overflowY_css !== "visible") {
        style.overflowY = props.overflowY_css as any;
    }
    // Legacy support for old overflow_css prop
    if (props.overflow_css && props.overflow_css !== "visible") {
        style.overflow = props.overflow_css as any;
    }

    // Debug logging — remove after confirming it works
    const cssKeys = Object.keys(style);
    if (cssKeys.length > 0) {
        console.log("[buildComponentStyle] output:", JSON.stringify(style));
    }

    return style;
}

