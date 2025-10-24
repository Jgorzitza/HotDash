import type { PageSEOData } from "../../lib/seo/seo-optimization";
interface SEOMetaProps {
    pageData: PageSEOData;
    additionalData?: any;
}
export declare function SEOMeta({ pageData, additionalData }: SEOMetaProps): React.JSX.Element;
export declare function useSEO(pageData: PageSEOData, additionalData?: any): {
    metaTags: string;
    structuredData: import("../../lib/seo/seo-optimization").StructuredData[];
    jsonLD: string;
};
export {};
//# sourceMappingURL=SEOMeta.d.ts.map