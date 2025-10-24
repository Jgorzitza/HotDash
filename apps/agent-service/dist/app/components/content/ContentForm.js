/**
 * Content Form Component
 *
 * Provides form interface for creating and editing content entries
 */
import { useState } from "react";
import { Card, Text, Button, TextField, Checkbox, } from "@shopify/polaris";
export function ContentForm({ contentType, initialData, onSubmit, onCancel, isLoading = false, }) {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        fields: initialData?.fields || {},
    });
    const [errors, setErrors] = useState({});
    const handleFieldChange = (fieldId, value) => {
        setFormData((prev) => ({
            ...prev,
            fields: {
                ...prev.fields,
                [fieldId]: value,
            },
        }));
        // Clear error when user starts typing
        if (errors[fieldId]) {
            setErrors((prev) => ({
                ...prev,
                [fieldId]: "",
            }));
        }
    };
    const handleTitleChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            title: value,
        }));
        // Auto-generate slug from title
        if (!initialData?.slug) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            setFormData((prev) => ({
                ...prev,
                slug,
            }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        // Validate title
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }
        // Validate slug
        if (!formData.slug.trim()) {
            newErrors.slug = "Slug is required";
        }
        else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug =
                "Slug can only contain lowercase letters, numbers, and hyphens";
        }
        // Validate required fields
        contentType.fields.forEach((field) => {
            if (field.required) {
                const value = formData.fields[field.id];
                if (!value || (typeof value === "string" && !value.trim())) {
                    newErrors[field.id] = `${field.name} is required`;
                }
            }
            // Validate field-specific rules
            if (field.validation) {
                const value = formData.fields[field.id];
                if (value) {
                    if (field.validation.min &&
                        typeof value === "number" &&
                        value < field.validation.min) {
                        newErrors[field.id] =
                            `${field.name} must be at least ${field.validation.min}`;
                    }
                    if (field.validation.max &&
                        typeof value === "number" &&
                        value > field.validation.max) {
                        newErrors[field.id] =
                            `${field.name} must be at most ${field.validation.max}`;
                    }
                    if (field.validation.pattern &&
                        typeof value === "string" &&
                        !new RegExp(field.validation.pattern).test(value)) {
                        newErrors[field.id] = `${field.name} format is invalid`;
                    }
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit({
                content_type_id: contentType.id,
                title: formData.title,
                slug: formData.slug,
                fields: formData.fields,
                created_by: "content-agent", // Replace with actual user ID
            });
        }
    };
    const renderField = (field) => {
        const value = formData.fields[field.id] || "";
        const hasError = !!errors[field.id];
        switch (field.type) {
            case "text":
                return (<TextField key={field.id} label={field.name} value={value} onChange={(newValue) => handleFieldChange(field.id, newValue)} error={hasError ? errors[field.id] : undefined} required={field.required} helpText={field.validation?.max
                        ? `Maximum ${field.validation.max} characters`
                        : undefined}/>);
            case "textarea":
                return (<TextField key={field.id} label={field.name} value={value} onChange={(newValue) => handleFieldChange(field.id, newValue)} error={hasError ? errors[field.id] : undefined} required={field.required} multiline={4} helpText={field.validation?.max
                        ? `Maximum ${field.validation.max} characters`
                        : undefined}/>);
            case "number":
                return (<TextField key={field.id} label={field.name} type="number" value={value.toString()} onChange={(newValue) => handleFieldChange(field.id, parseFloat(newValue) || 0)} error={hasError ? errors[field.id] : undefined} required={field.required} min={field.validation?.min} max={field.validation?.max}/>);
            case "boolean":
                return (<div key={field.id} style={{ marginBottom: "16px" }}>
            <Checkbox label={field.name} checked={value} onChange={(newValue) => handleFieldChange(field.id, newValue)}/>
          </div>);
            case "date":
                return (<TextField key={field.id} label={field.name} type="date" value={value} onChange={(newValue) => handleFieldChange(field.id, newValue)} error={hasError ? errors[field.id] : undefined} required={field.required}/>);
            case "rich_text":
                return (<TextField key={field.id} label={field.name} value={value} onChange={(newValue) => handleFieldChange(field.id, newValue)} error={hasError ? errors[field.id] : undefined} required={field.required} multiline={6} helpText="Use Markdown formatting"/>);
            default:
                return (<TextField key={field.id} label={field.name} value={value} onChange={(newValue) => handleFieldChange(field.id, newValue)} error={hasError ? errors[field.id] : undefined} required={field.required}/>);
        }
    };
    return (<Card>
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Text as="h3" variant="headingMd">
            {initialData ? "Edit" : "Create"} {contentType.name}
          </Text>

          {/* Title and Slug */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField label="Title" value={formData.title} onChange={handleTitleChange} error={errors.title} required placeholder="Enter content title"/>

            <TextField label="Slug" value={formData.slug} onChange={(value) => setFormData((prev) => ({ ...prev, slug: value }))} error={errors.slug} required placeholder="content-slug" helpText="URL-friendly version of the title"/>
          </div>

          {/* Dynamic Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {contentType.fields.map((field) => renderField(field))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
              {initialData ? "Update" : "Create"} Content
            </Button>
          </div>
        </div>
      </div>
    </Card>);
}
//# sourceMappingURL=ContentForm.js.map