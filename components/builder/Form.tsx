import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select, radio
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
}

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
}: FormProps) {
  const renderField = (field: FormField) => {
    const fieldId = `field-${field.id}`;

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId}>{field.label}</Label>
            <textarea
              id={fieldId}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId}>{field.label}</Label>
            <select
              id={fieldId}
              name={field.id}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select an option</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>
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
              className="rounded border-gray-300 focus:ring-primary"
            />
            <Label htmlFor={fieldId}>{field.label}</Label>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${fieldId}-${index}`}
                    name={field.id}
                    value={option}
                    required={field.required}
                    className="border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor={`${fieldId}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId}>{field.label}</Label>
            <Input
              type={field.type}
              id={fieldId}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <div
      className={cn("w-full max-w-md mx-auto", className)}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    >
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}

      {description && <p className="text-gray-600 mb-6">{description}</p>}

      <form action={action} method={method} className="space-y-4">
        {fields.map(renderField)}

        <Button type="submit" className="w-full">
          {submitText}
        </Button>
      </form>
    </div>
  );
}
