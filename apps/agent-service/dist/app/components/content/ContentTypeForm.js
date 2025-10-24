/**
 * Content Type Form Component
 *
 * Provides form interface for creating and editing content types
 */
import { useState } from "react";
import { Card, Text, Button, TextField, Select, Checkbox, } from "@shopify/polaris";
const FIELD_TYPES = [
    { label: "Text", value: "text" },
    { label: "Textarea", value: "textarea" },
    { label: "Rich Text", value: "rich_text" },
    { label: "Number", value: "number" },
    { label: "Boolean", value: "boolean" },
    { label: "Date", value: "date" },
    { label: "Image", value: "image" },
    { label: "File", value: "file" },
];
export function ContentTypeForm({ initialData, onSubmit, onCancel, isLoading = false, }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        fields: initialData?.fields || [],
    });
    const [errors, setErrors] = useState({});
    const handleFieldChange = (index, field) => {
        const newFields = [...formData.fields];
        newFields[index] = { ...newFields[index], ...field };
        setFormData((prev) => ({
            ...prev,
            fields: newFields,
        }));
    };
    const addField = () => {
        const newField = {
            id: "",
            name: "",
            type: "text",
            required: false,
            localized: false,
        };
        setFormData((prev) => ({
            ...prev,
            fields: [...prev.fields, newField],
        }));
    };
    const removeField = (index) => {
        setFormData((prev) => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index),
        }));
    };
    const validateForm = () => {
        const newErrors = {};
        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = "Content type name is required";
        }
        // Validate fields
        formData.fields.forEach((field, index) => {
            if (!field.id.trim()) {
                newErrors[`field_${index}_id`] = "Field ID is required";
            }
            if (!field.name.trim()) {
                newErrors[`field_${index}_name`] = "Field name is required";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit({
                name: formData.name,
                description: formData.description,
                fields: formData.fields,
            });
        }
    };
    return (<Card>
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Text as="h3" variant="headingMd">
            {initialData ? "Edit" : "Create"} Content Type
          </Text>

          {/* Basic Information */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField label="Content Type Name" value={formData.name} onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))} error={errors.name} required placeholder="e.g., Article, Product, Page"/>

            <TextField label="Description" value={formData.description} onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))} multiline={3} placeholder="Describe what this content type is used for"/>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
              <Text as="h4" variant="headingMd">
                Fields
              </Text>
              <Button onClick={addField} size="slim">
                Add Field
              </Button>
            </div>

            {formData.fields.length === 0 ? (<Text as="p" tone="subdued">
                No fields added yet. Click "Add Field" to get started.
              </Text>) : (<div style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
            }}>
                {formData.fields.map((field, index) => (<div key={index} style={{
                    padding: "16px",
                    border: "1px solid #e1e3e5",
                    borderRadius: "4px",
                }}>
                    <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                }}>
                      <Text as="p" fontWeight="semibold">
                        Field {index + 1}
                      </Text>
                      <Button onClick={() => removeField(index)} size="slim" variant="tertiary" tone="critical">
                        Remove
                      </Button>
                    </div>

                    <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <TextField label="Field ID" value={field.id} onChange={(value) => handleFieldChange(index, { id: value })} error={errors[`field_${index}_id`]} required placeholder="e.g., title, content, price"/>
                        </div>
                        <div style={{ flex: 1 }}>
                          <TextField label="Field Name" value={field.name} onChange={(value) => handleFieldChange(index, { name: value })} error={errors[`field_${index}_name`]} required placeholder="e.g., Title, Content, Price"/>
                        </div>
                      </div>

                      <Select label="Field Type" options={FIELD_TYPES} value={field.type} onChange={(value) => handleFieldChange(index, {
                    type: value,
                })}/>

                      <div style={{ display: "flex", gap: "12px" }}>
                        <Checkbox label="Required" checked={field.required} onChange={(value) => handleFieldChange(index, { required: value })}/>
                        <Checkbox label="Localized" checked={field.localized} onChange={(value) => handleFieldChange(index, { localized: value })}/>
                      </div>

                      {/* Validation Rules */}
                      <div style={{ display: "flex", gap: "12px" }}>
                        <TextField label="Min Value" type="number" value={field.validation?.min?.toString() || ""} onChange={(value) => handleFieldChange(index, {
                    validation: {
                        ...field.validation,
                        min: value ? parseFloat(value) : undefined,
                    },
                })} placeholder="Minimum value"/>
                        <TextField label="Max Value" type="number" value={field.validation?.max?.toString() || ""} onChange={(value) => handleFieldChange(index, {
                    validation: {
                        ...field.validation,
                        max: value ? parseFloat(value) : undefined,
                    },
                })} placeholder="Maximum value"/>
                      </div>

                      <TextField label="Pattern (Regex)" value={field.validation?.pattern || ""} onChange={(value) => handleFieldChange(index, {
                    validation: {
                        ...field.validation,
                        pattern: value || undefined,
                    },
                })} placeholder="Regular expression pattern"/>
                    </div>
                  </div>))}
              </div>)}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
              {initialData ? "Update" : "Create"} Content Type
            </Button>
          </div>
        </div>
      </div>
    </Card>);
}
//# sourceMappingURL=ContentTypeForm.js.map