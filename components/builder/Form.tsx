import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface FormProps {
  title?: string;
  description?: string;
  fields?: FormField[];
  submitText?: string;
  action?: string;
  method?: "GET" | "POST";
  className?: string;
  layout?: "vertical" | "horizontal";
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

const inputClasses = "w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-foreground placeholder:text-muted-foreground";

export function Form({
  title,
  description,
  fields = [],
  submitText = "Submit",
  action = "#",
  method = "POST",
  className,
  layout = "vertical",
  width,
  height,
  backgroundColor,
  textColor,
  ...rest
}: FormProps) {
  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  // If no background color is set, make it transparent (inherit from parent)
  if (!backgroundColor && !rest.backgroundType) {
    baseStyle.backgroundColor = "transparent";
  }

  const renderField = (field: FormField) => {
    const fieldId = `field-${field.id}`;

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-foreground/80">
              {field.label}
            </Label>
            <textarea
              id={fieldId}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              className={cn(inputClasses, "min-h-[100px]")}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-foreground/80">
              {field.label}
            </Label>
            <select
              id={fieldId}
              name={field.id}
              required={field.required}
              className={inputClasses}
            >
              <option value="" className="bg-card">
                Select an option
              </option>
              {field.options?.map((option, index) => (
                <option key={index} value={option} className="bg-card">
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={fieldId}
              name={field.id}
              required={field.required}
              className="rounded border-border focus:ring-primary bg-card"
            />
            <Label htmlFor={fieldId} className="text-foreground/80">
              {field.label}
            </Label>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-foreground/80">{field.label}</Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${fieldId}-${index}`}
                    name={field.id}
                    value={option}
                    required={field.required}
                    className="border-border focus:ring-primary bg-card"
                  />
                  <Label
                    htmlFor={`${fieldId}-${index}`}
                    className="text-foreground/80"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        // text, email, tel — all use the same consistent styling
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-foreground/80">
              {field.label}
            </Label>
            <input
              type={field.type}
              id={fieldId}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              className={inputClasses}
            />
          </div>
        );
    }
  };

  return (
    <div className={cn("w-full", className)} style={baseStyle}>
      {title && <h2 className="text-2xl font-bold mb-2 text-foreground">{title}</h2>}

      {description && <p className="mb-6 text-muted-foreground">{description}</p>}

      <form action={action} method={method} className="space-y-4">
        {fields.map((field) => renderField(field))}

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {submitText}
        </Button>
      </form>
    </div>
  );
}
