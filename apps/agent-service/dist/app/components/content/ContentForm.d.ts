/**
 * Content Form Component
 *
 * Provides form interface for creating and editing content entries
 */
interface ContentFormProps {
    contentType: {
        id: string;
        name: string;
        fields: Array<{
            id: string;
            name: string;
            type: string;
            required: boolean;
            localized: boolean;
            validation?: {
                min?: number;
                max?: number;
                pattern?: string;
            };
        }>;
    };
    initialData?: {
        title: string;
        slug: string;
        fields: Record<string, any>;
    };
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
}
export declare function ContentForm({ contentType, initialData, onSubmit, onCancel, isLoading, }: ContentFormProps): React.JSX.Element;
export {};
//# sourceMappingURL=ContentForm.d.ts.map