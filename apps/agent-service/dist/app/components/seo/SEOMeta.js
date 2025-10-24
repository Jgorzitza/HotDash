import { seoOptimizer } from "../../lib/seo/seo-optimization";
export function SEOMeta({ pageData, additionalData }) {
    const metaTags = seoOptimizer.generateMetaTags(pageData);
    const structuredData = seoOptimizer.generateStructuredData(pageData, additionalData);
    const jsonLD = seoOptimizer.generateJSONLD(structuredData);
    return (<>
      <div dangerouslySetInnerHTML={{ __html: metaTags }}/>
      <div dangerouslySetInnerHTML={{ __html: jsonLD }}/>
    </>);
}
// Hook for easy SEO data management
export function useSEO(pageData, additionalData) {
    return {
        metaTags: seoOptimizer.generateMetaTags(pageData),
        structuredData: seoOptimizer.generateStructuredData(pageData, additionalData),
        jsonLD: seoOptimizer.generateJSONLD(seoOptimizer.generateStructuredData(pageData, additionalData))
    };
}
//# sourceMappingURL=SEOMeta.js.map