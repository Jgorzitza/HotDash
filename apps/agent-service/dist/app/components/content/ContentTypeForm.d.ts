/**
 * Content Type Form Component
 *
 * Provides form interface for creating and editing content types
 */
interface ContentField {
    id: string;
    name: string;
    type: "text" | "textarea" | "rich_text" | "number" | "boolean" | "date" | "image" | "file";
    required: boolean;
    localized: boolean;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}
interface ContentTypeFormProps {
    initialData?: {
        name: string;
        description: string;
        fields: ContentField[];
    };
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
}
export declare function ContentTypeForm({ initialData, onSubmit, onCancel, isLoading, }: ContentTypeFormProps): React.JSX.Element;
export {};
//# sourceMappingURL=ContentTypeForm.d.ts.map