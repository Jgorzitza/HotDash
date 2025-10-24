interface ValidationError {
    field: string;
    message: string;
}
interface ValidationBannerProps {
    errors: ValidationError[];
    onDismiss?: () => void;
}
export declare function ValidationBanner({ errors, onDismiss }: ValidationBannerProps): React.JSX.Element;
export {};
//# sourceMappingURL=ValidationBanner.d.ts.map