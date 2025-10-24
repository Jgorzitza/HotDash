import type { PageSEOData } from "../../lib/seo/seo-optimization";
import { seoOptimizer } from "../../lib/seo/seo-optimization";

interface SEOMetaProps {
  pageData: PageSEOData;
  additionalData?: any;
}

export function SEOMeta({ pageData, additionalData }: SEOMetaProps) {
  const metaTags = seoOptimizer.generateMetaTags(pageData);
  const structuredData = seoOptimizer.generateStructuredData(pageData, additionalData);
  const jsonLD = seoOptimizer.generateJSONLD(structuredData);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: metaTags }} />
      <div dangerouslySetInnerHTML={{ __html: jsonLD }} />
    </>
  );
}

// Hook for easy SEO data management
export function useSEO(pageData: PageSEOData, additionalData?: any) {
  return {
    metaTags: seoOptimizer.generateMetaTags(pageData),
    structuredData: seoOptimizer.generateStructuredData(pageData, additionalData),
    jsonLD: seoOptimizer.generateJSONLD(seoOptimizer.generateStructuredData(pageData, additionalData))
  };
}
