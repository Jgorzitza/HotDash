-- Product Affinity Migration
-- Owner: data
-- Purpose: Calculate product affinity (what's bought together) for Guided Selling Recommender
-- Related: Growth Spec B4, enables C4 Guided Selling (~15% AOV increase)

-- Product affinity table: tracks co-purchase patterns
CREATE TABLE IF NOT EXISTS public.product_affinity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product pair
  product_a_id BIGINT NOT NULL, -- Shopify product ID
  product_b_id BIGINT NOT NULL, -- Shopify product ID (product_a < product_b to avoid duplicates)
  
  -- Affinity metrics
  co_purchase_count INT NOT NULL DEFAULT 1, -- Times bought together
  support NUMERIC(5,4) NOT NULL, -- % of orders containing both items
  confidence NUMERIC(5,4) NOT NULL, -- P(B|A): if customer buys A, probability they buy B
  lift NUMERIC(6,3) NOT NULL, -- How much more likely B is purchased with A vs. alone
  
  -- Context
  total_orders_analyzed INT NOT NULL, -- Denominator for support calculation
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT product_affinity_order_check CHECK (product_a_id < product_b_id), -- Avoid duplicate pairs
  CONSTRAINT product_affinity_unique_pair UNIQUE (product_a_id, product_b_id)
);

COMMENT ON TABLE public.product_affinity IS 'Product affinity scores for co-purchase recommendations (Guided Selling)';
COMMENT ON COLUMN public.product_affinity.support IS 'Percentage of orders containing both products (frequency)';
COMMENT ON COLUMN public.product_affinity.confidence IS 'P(product_b | product_a): Conditional probability of buying B given A';
COMMENT ON COLUMN public.product_affinity.lift IS 'How much more likely B is purchased with A (>1 = positive affinity)';

-- Indexes for performance
CREATE INDEX idx_product_affinity_product_a ON public.product_affinity(product_a_id);
CREATE INDEX idx_product_affinity_product_b ON public.product_affinity(product_b_id);
CREATE INDEX idx_product_affinity_confidence ON public.product_affinity(confidence DESC); -- For top recommendations
CREATE INDEX idx_product_affinity_lift ON public.product_affinity(lift DESC); -- For strongest affinities
CREATE INDEX idx_product_affinity_last_calc ON public.product_affinity(last_calculated_at DESC);

-- RLS policies
ALTER TABLE public.product_affinity ENABLE ROW LEVEL SECURITY;

-- Service role can write (for ETL jobs)
CREATE POLICY product_affinity_service_write 
  ON public.product_affinity FOR ALL 
  USING (auth.role() = 'service_role');

-- Authenticated users can read (for recommendations)
CREATE POLICY product_affinity_read_authenticated 
  ON public.product_affinity FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Function to get product recommendations based on cart contents
CREATE OR REPLACE FUNCTION public.get_product_recommendations(
  cart_product_ids BIGINT[],
  min_confidence NUMERIC DEFAULT 0.20,
  min_lift NUMERIC DEFAULT 1.2,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  recommended_product_id BIGINT,
  avg_confidence NUMERIC,
  avg_lift NUMERIC,
  recommendation_strength TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN pa.product_a_id = ANY(cart_product_ids) THEN pa.product_b_id
      ELSE pa.product_a_id
    END as recommended_product_id,
    AVG(pa.confidence)::NUMERIC(5,4) as avg_confidence,
    AVG(pa.lift)::NUMERIC(6,3) as avg_lift,
    CASE 
      WHEN AVG(pa.confidence) >= 0.50 THEN 'strong'
      WHEN AVG(pa.confidence) >= 0.30 THEN 'medium'
      ELSE 'weak'
    END::TEXT as recommendation_strength
  FROM public.product_affinity pa
  WHERE 
    (pa.product_a_id = ANY(cart_product_ids) OR pa.product_b_id = ANY(cart_product_ids))
    AND pa.confidence >= min_confidence
    AND pa.lift >= min_lift
  GROUP BY recommended_product_id
  HAVING 
    CASE 
      WHEN pa.product_a_id = ANY(cart_product_ids) THEN pa.product_b_id
      ELSE pa.product_a_id
    END <> ALL(cart_product_ids) -- Exclude products already in cart
  ORDER BY avg_confidence DESC, avg_lift DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.get_product_recommendations IS 'Get product recommendations based on cart contents using affinity scores';

-- View for top product pairs (for dashboard)
CREATE OR REPLACE VIEW public.v_top_product_pairs AS
SELECT 
  pa.product_a_id,
  pa.product_b_id,
  pa.co_purchase_count,
  pa.support,
  pa.confidence,
  pa.lift,
  pa.last_calculated_at
FROM public.product_affinity pa
WHERE pa.confidence >= 0.20 AND pa.lift >= 1.2
ORDER BY pa.lift DESC, pa.confidence DESC
LIMIT 100;

COMMENT ON VIEW public.v_top_product_pairs IS 'Top 100 product pairs by affinity for operator dashboard';

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.set_timestamp_product_affinity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_affinity_updated_at ON public.product_affinity;
CREATE TRIGGER trg_product_affinity_updated_at
  BEFORE UPDATE ON public.product_affinity
  FOR EACH ROW EXECUTE PROCEDURE public.set_timestamp_product_affinity();

