import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const renderField = (field: FormField) => {
    const fieldId = `field-${field.id}`;

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-gray-300">
              {field.label}
            </Label>
            <textarea
              id={fieldId}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full min-h-[100px] px-3 py-2 border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#1a1a1a] text-white placeholder:text-gray-500"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-gray-300">
              {field.label}
            </Label>
            <select
              id={fieldId}
              name={field.id}
              required={field.required}
              className="w-full px-3 py-2 border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#1a1a1a] text-white"
            >
              <option value="" className="bg-[#1a1a1a]">
                Select an option
              </option>
              {field.options?.map((option, index) => (
                <option key={index} value={option} className="bg-[#1a1a1a]">
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
              className="rounded border-[#2a2a2a] focus:ring-blue-500 bg-[#1a1a1a]"
            />
            <Label htmlFor={fieldId} className="text-gray-300">
              {field.label}
            </Label>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-gray-300">{field.label}</Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${fieldId}-${index}`}
                    name={field.id}
                    value={option}
                    required={field.required}
                    className="border-[#2a2a2a] focus:ring-blue-500 bg-[#1a1a1a]"
                  />
                  <Label
                    htmlFor={`${fieldId}-${index}`}
                    className="text-gray-300"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-gray-300">
              {field.label}
            </Label>
            <Input
              type={field.type}
              id={fieldId}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:ring-blue-500"
            />
          </div>
        );
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)} style={baseStyle}>
      {title && <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>}

      {description && <p className="mb-6 text-gray-400">{description}</p>}

      <form action={action} method={method} className="space-y-4">
        {fields.map(renderField)}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {submitText}
        </Button>
      </form>
    </div>
  );
}
