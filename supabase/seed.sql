-- Minimal seed data for inventory dashboard checks
-- Safe to re-run; uses upserts and guards for optional tables.

BEGIN;

-- Guard against runaway commands so seeding fails fast when blocked.
SET LOCAL statement_timeout = '5s';
SET LOCAL lock_timeout = '2s';

DO $$
DECLARE
  bundle_id BIGINT;
  component_id BIGINT;
  exp_id_flathead UUID;
  exp_id_cart UUID;
BEGIN
  -- Seed inventory_products if table exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'inventory_products'
  ) THEN
    INSERT INTO public.inventory_products (
      shop_domain,
      product_gid,
      variant_gid,
      sku,
      title,
      status_bucket,
      pack,
      is_bundle,
      lead_time_days,
      max_lead_days,
      avg_daily_sales,
      max_daily_sales,
      safety_stock,
      reorder_point
    ) VALUES
      (
        'seed.hotdash.test',
        'gid://shopify/Product/901',
        'gid://shopify/ProductVariant/901',
        'SEED-SKU-BASE',
        'Seed Base Item',
        'in_stock',
        1,
        false,
        5,
        7,
        2,
        4,
        8,
        18
      ),
      (
        'seed.hotdash.test',
        'gid://shopify/Product/902',
        'gid://shopify/ProductVariant/902',
        'SEED-SKU-BUNDLE',
        'Seed Bundle Item',
        'low_stock',
        1,
        true,
        7,
        10,
        3,
        6,
        9,
        30
      ),
      (
        'seed2.hotdash.test',
        'gid://shopify/Product/1101',
        'gid://shopify/ProductVariant/1101',
        'SEED2-SKU-BASE',
        'Seed2 Base Item',
        'in_stock',
        1,
        false,
        6,
        9,
        4,
        5,
        10,
        22
      ),
      (
        'seed2.hotdash.test',
        'gid://shopify/Product/1102',
        'gid://shopify/ProductVariant/1102',
        'SEED2-SKU-BUNDLE',
        'Seed2 Bundle Item',
        'urgent_reorder',
        1,
        true,
        8,
        12,
        5,
        8,
        12,
        28
      )
    ON CONFLICT (shop_domain, sku) DO UPDATE
      SET
        title = EXCLUDED.title,
        status_bucket = EXCLUDED.status_bucket,
        is_bundle = EXCLUDED.is_bundle,
        lead_time_days = EXCLUDED.lead_time_days,
        max_lead_days = EXCLUDED.max_lead_days,
        avg_daily_sales = EXCLUDED.avg_daily_sales,
        max_daily_sales = EXCLUDED.max_daily_sales,
        safety_stock = EXCLUDED.safety_stock,
        reorder_point = EXCLUDED.reorder_point,
        updated_at = NOW();

    SELECT id
      INTO component_id
      FROM public.inventory_products
      WHERE shop_domain = 'seed.hotdash.test' AND sku = 'SEED-SKU-BASE';

    SELECT id
      INTO bundle_id
      FROM public.inventory_products
      WHERE shop_domain = 'seed.hotdash.test' AND sku = 'SEED-SKU-BUNDLE';

    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'inventory_bundle_components'
    ) THEN
      DELETE FROM public.inventory_bundle_components
       WHERE shop_domain = 'seed.hotdash.test'
         AND bundle_product_id = bundle_id;

      INSERT INTO public.inventory_bundle_components (
        shop_domain,
        bundle_product_id,
        component_product_id,
        component_sku,
        component_qty
      ) VALUES (
        'seed.hotdash.test',
        bundle_id,
        component_id,
        'SEED-SKU-BASE',
        2
      );

      SELECT id
        INTO component_id
        FROM public.inventory_products
        WHERE shop_domain = 'seed2.hotdash.test' AND sku = 'SEED2-SKU-BASE';

      SELECT id
        INTO bundle_id
        FROM public.inventory_products
        WHERE shop_domain = 'seed2.hotdash.test' AND sku = 'SEED2-SKU-BUNDLE';

      DELETE FROM public.inventory_bundle_components
       WHERE shop_domain = 'seed2.hotdash.test'
         AND bundle_product_id = bundle_id;

      INSERT INTO public.inventory_bundle_components (
        shop_domain,
        bundle_product_id,
        component_product_id,
        component_sku,
        component_qty
      ) VALUES (
        'seed2.hotdash.test',
        bundle_id,
        component_id,
        'SEED2-SKU-BASE',
        3
      );
    END IF;
  END IF;

  -- Seed picker payouts and lines if tables exist
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'picker_payouts'
  ) THEN
    PERFORM id
    FROM public.picker_payouts
    WHERE shop_domain = 'seed.hotdash.test' AND order_name = 'SEED-ORDER-1';

    IF NOT FOUND THEN
      INSERT INTO public.picker_payouts (
        shop_domain,
        order_gid,
        order_name,
        total_pieces,
        bracket_code,
        payout_cents,
        metadata
      ) VALUES (
        'seed.hotdash.test',
        'gid://shopify/Order/9001',
        'SEED-ORDER-1',
        6,
        'B2_5_10',
        1800,
        jsonb_build_object('source', 'seed')
      )
      RETURNING id INTO bundle_id;
    ELSE
      bundle_id := (SELECT id FROM public.picker_payouts WHERE shop_domain = 'seed.hotdash.test' AND order_name = 'SEED-ORDER-1');
      UPDATE public.picker_payouts
         SET total_pieces = 6,
             bracket_code = 'B2_5_10',
             payout_cents = 1800,
             metadata = jsonb_build_object('source', 'seed'),
             updated_at = NOW()
       WHERE id = bundle_id;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'picker_payout_lines'
    ) THEN
      DELETE FROM public.picker_payout_lines
       WHERE payout_id = bundle_id;

      INSERT INTO public.picker_payout_lines (
        payout_id,
        shop_domain,
        sku,
        title,
        pieces
      ) VALUES (
        bundle_id,
        'seed.hotdash.test',
        'SEED-SKU-BASE',
        'Seed Base Item',
        6
      );
    END IF;

    PERFORM id
    FROM public.picker_payouts
    WHERE shop_domain = 'seed2.hotdash.test' AND order_name = 'SEED2-ORDER-1';

    IF NOT FOUND THEN
      INSERT INTO public.picker_payouts (
        shop_domain,
        order_gid,
        order_name,
        total_pieces,
        bracket_code,
        payout_cents,
        metadata
      ) VALUES (
        'seed2.hotdash.test',
        'gid://shopify/Order/11001',
        'SEED2-ORDER-1',
        12,
        'B3_11_PLUS',
        3600,
        jsonb_build_object('source', 'seed2')
      )
      RETURNING id INTO bundle_id;
    ELSE
      bundle_id := (SELECT id FROM public.picker_payouts WHERE shop_domain = 'seed2.hotdash.test' AND order_name = 'SEED2-ORDER-1');
      UPDATE public.picker_payouts
         SET total_pieces = 12,
             bracket_code = 'B3_11_PLUS',
             payout_cents = 3600,
             metadata = jsonb_build_object('source', 'seed2'),
             updated_at = NOW()
       WHERE id = bundle_id;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'picker_payout_lines'
    ) THEN
      DELETE FROM public.picker_payout_lines
       WHERE payout_id = bundle_id;

      INSERT INTO public.picker_payout_lines (
        payout_id,
        shop_domain,
        sku,
        title,
        pieces
      ) VALUES (
        bundle_id,
        'seed2.hotdash.test',
        'SEED2-SKU-BASE',
        'Seed2 Base Item',
        12
      );
    END IF;
  END IF;

  -- Seed programmatic SEO data if the new tables exist.
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'programmatic_seo_blueprints'
  ) THEN
    INSERT INTO public.programmatic_seo_blueprints (
      blueprint_slug,
      metaobject_type,
      title,
      status,
      primary_topic,
      preview_path,
      hero_content,
      structured_payload,
      generation_notes,
      last_generated_at
    ) VALUES
      (
        'flathead-engine-build-guide',
        'landing_page',
        'Flathead Engine Build Guide',
        'ready',
        jsonb_build_object('entity', 'engine', 'model', 'Flathead V8', 'year', 1953),
        '/preview/l/flathead-engine-build-guide',
        jsonb_build_object('hero_image', 'https://cdn.dev/flathead.jpg', 'cta', 'See build steps'),
        jsonb_build_object('faq_ref', ARRAY['faq-flathead-blocking'], 'related_products', ARRAY['gid://shopify/Product/901']),
        'Seeded blueprint to validate nightly sweeps',
        NOW() - INTERVAL '1 day'
      ),
      (
        'tri-five-chevy-vs-bel-air',
        'comparison',
        'Tri-Five Chevy vs Bel Air: Which build fits?',
        'draft',
        jsonb_build_object('entity', 'vehicle', 'model', 'Tri-Five Chevy', 'year_range', '1955-1957'),
        '/preview/l/tri-five-chevy-vs-bel-air',
        jsonb_build_object('hero_image', 'https://cdn.dev/tri-five.jpg'),
        jsonb_build_object('pros', ARRAY['Iconic profile', 'Readily available parts'], 'cons', ARRAY['Higher paint cost']),
        'Draft comparison seeded for QA',
        NULL
      )
    ON CONFLICT (blueprint_slug) DO UPDATE
      SET
        metaobject_type = EXCLUDED.metaobject_type,
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        primary_topic = EXCLUDED.primary_topic,
        preview_path = EXCLUDED.preview_path,
        hero_content = EXCLUDED.hero_content,
        structured_payload = EXCLUDED.structured_payload,
        generation_notes = EXCLUDED.generation_notes,
        last_generated_at = EXCLUDED.last_generated_at,
        updated_at = NOW();

    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'programmatic_seo_internal_links'
    ) THEN
      WITH blueprint_ids AS (
        SELECT blueprint_slug, id FROM public.programmatic_seo_blueprints
        WHERE blueprint_slug IN ('flathead-engine-build-guide', 'tri-five-chevy-vs-bel-air')
      )
      INSERT INTO public.programmatic_seo_internal_links (
        blueprint_id,
        target_slug,
        anchor_text,
        relationship,
        confidence
      )
      SELECT
        b.id,
        CASE b.blueprint_slug
          WHEN 'flathead-engine-build-guide' THEN 'flathead-carb-upgrade'
          ELSE 'bel-air-upgrade-kit'
        END,
        CASE b.blueprint_slug
          WHEN 'flathead-engine-build-guide' THEN 'Holley 4-Barrel Upgrade'
          ELSE 'Bel Air Suspension Refresh'
        END,
        'related',
        0.82
      FROM blueprint_ids b
      ON CONFLICT (blueprint_id, target_slug, anchor_text) DO UPDATE
        SET confidence = EXCLUDED.confidence,
            relationship = EXCLUDED.relationship,
            created_at = NOW();
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'programmatic_seo_generation_runs'
    ) THEN
      INSERT INTO public.programmatic_seo_generation_runs (
        blueprint_id,
        requested_by,
        template_version,
        status,
        run_started_at,
        run_completed_at,
        payload,
        failure_reason
      )
      SELECT
        id,
        'system-seed',
        'v0.1',
        'succeeded',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day' + INTERVAL '2 minutes',
        jsonb_build_object('html_bytes', 14325, 'blocks_rendered', 7),
        NULL
      FROM public.programmatic_seo_blueprints
      WHERE blueprint_slug = 'flathead-engine-build-guide'
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'guided_vehicle_profiles'
  ) THEN
    INSERT INTO public.guided_vehicle_profiles (
      profile_slug,
      make,
      model,
      model_year,
      trim,
      engine,
      fuel,
      horsepower_min,
      horsepower_max,
      metadata
    ) VALUES
      (
        '1953-flathead-deluxe',
        'Ford',
        'F100',
        1953,
        'Deluxe',
        'Flathead V8',
        'gasoline',
        90,
        125,
        jsonb_build_object('notes','Baseline for Flathead kits')
      ),
      (
        '1956-tri-five-belair',
        'Chevrolet',
        'Bel Air',
        1956,
        'Sport Coupe',
        'Small Block V8',
        'gasoline',
        162,
        205,
        jsonb_build_object('notes','High-demand Tri-Five configuration')
      )
    ON CONFLICT (profile_slug) DO UPDATE
      SET
        make = EXCLUDED.make,
        model = EXCLUDED.model,
        model_year = EXCLUDED.model_year,
        trim = EXCLUDED.trim,
        engine = EXCLUDED.engine,
        fuel = EXCLUDED.fuel,
        horsepower_min = EXCLUDED.horsepower_min,
        horsepower_max = EXCLUDED.horsepower_max,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'guided_use_case_modifiers'
  ) THEN
    INSERT INTO public.guided_use_case_modifiers (
      modifier_slug,
      title,
      description,
      tow_capacity_min,
      tow_capacity_max,
      altitude_min_ft,
      altitude_max_ft,
      horsepower_band,
      adjustment_payload
    ) VALUES
      (
        'mountain-tow',
        'Mountain Tow Package',
        'Adds high-altitude fuel and cooling adjustments for towing above 5,000 ft.',
        3500,
        7500,
        5000,
        9000,
        jsonb_build_object('min',120,'max',220),
        jsonb_build_object('add_optional_parts', ARRAY['ALTITUDE_JET_KIT','TRANS_COOLER'])
      ),
      (
        'street-cruise',
        'Street Cruiser',
        'Light-duty cruising setup focused on drivability.',
        0,
        2500,
        0,
        3000,
        jsonb_build_object('min',80,'max',180),
        jsonb_build_object('remove_optional_parts', ARRAY['HEAVY_DUTY_CLUTCH'])
      )
    ON CONFLICT (modifier_slug) DO UPDATE
      SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        tow_capacity_min = EXCLUDED.tow_capacity_min,
        tow_capacity_max = EXCLUDED.tow_capacity_max,
        altitude_min_ft = EXCLUDED.altitude_min_ft,
        altitude_max_ft = EXCLUDED.altitude_max_ft,
        horsepower_band = EXCLUDED.horsepower_band,
        adjustment_payload = EXCLUDED.adjustment_payload,
        updated_at = NOW();
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'guided_kit_bundles'
  ) THEN
    INSERT INTO public.guided_kit_bundles (
      bundle_slug,
      base_sku,
      title,
      summary,
      required_parts,
      optional_parts,
      install_time_minutes,
      labor_hours_estimate,
      rationale,
      notes
    ) VALUES
      (
        'flathead-stage1-kit',
        'KIT-FLATHEAD-STAGE1',
        'Flathead Stage 1 Fuel & Ignition Kit',
        'Baseline refresh for Flathead builds including carb, distributor, wiring, and regulator.',
        jsonb_build_object('parts', ARRAY['CARB-94','DISTRIBUTOR-12V','REGULATOR-ALT'] ),
        jsonb_build_object('parts', ARRAY['FUEL_FILTER-GLASS','HARNESS-UPGRADE'] ),
        240,
        4.5,
        'Improves cold starts while preserving period-correct intake.',
        jsonb_build_object('evidence_link','https://internal.docs/flathead-stage1')
      ),
      (
        'tri-five-stage2-kit',
        'KIT-TRIFIVE-STAGE2',
        'Tri-Five Stage 2 Performance Kit',
        'Adds dual-quad intake, high-flow fuel system, and supporting gauges.',
        jsonb_build_object('parts', ARRAY['INTAKE-DUALQUAD','FUELPUMP-HI','GAUGE-PACK'] ),
        jsonb_build_object('parts', ARRAY['TRANS_COOLER','ALTITUDE_JET_KIT'] ),
        360,
        6.0,
        'Targets 20% HP gain with stable fuel delivery for weekend track duty.',
        jsonb_build_object('evidence_link','https://internal.docs/trifive-stage2')
      )
    ON CONFLICT (bundle_slug) DO UPDATE
      SET
        base_sku = EXCLUDED.base_sku,
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        required_parts = EXCLUDED.required_parts,
        optional_parts = EXCLUDED.optional_parts,
        install_time_minutes = EXCLUDED.install_time_minutes,
        labor_hours_estimate = EXCLUDED.labor_hours_estimate,
        rationale = EXCLUDED.rationale,
        notes = EXCLUDED.notes,
        updated_at = NOW();
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'guided_conflict_rules'
  ) THEN
    INSERT INTO public.guided_conflict_rules (
      rule_slug,
      title,
      incompatible_parts,
      fallback_message,
      severity,
      metadata
    ) VALUES
      (
        'flathead-12v-retrofit',
        'Flathead 12V Retrofit Conflict',
        jsonb_build_object('parts', ARRAY['GENERATOR-6V','HARNESS-ORIGINAL']),
        'Swap generator and harness before enabling Stage 1 kit to avoid voltage mismatch.',
        'warn',
        jsonb_build_object('remediation','Offer wiring harness upgrade or downgrade kit selection')
      ),
      (
        'trifive-fuel-pressure',
        'Tri-Five Fuel Pressure Safety',
        jsonb_build_object('parts', ARRAY['FUELPUMP-HI','STOCK-FUEL-LINES']),
        'Upgrade to reinforced fuel lines or downgrade pump to avoid leak risk.',
        'error',
        jsonb_build_object('requires_approval',true)
      )
    ON CONFLICT (rule_slug) DO UPDATE
      SET
        title = EXCLUDED.title,
        incompatible_parts = EXCLUDED.incompatible_parts,
        fallback_message = EXCLUDED.fallback_message,
        severity = EXCLUDED.severity,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'guided_recommendation_edges'
  ) THEN
    INSERT INTO public.guided_recommendation_edges (
      from_type,
      from_slug,
      to_type,
      to_slug,
      rationale,
      evidence_link,
      weight
    ) VALUES
      (
        'VehicleProfile',
        '1953-flathead-deluxe',
        'KitBundle',
        'flathead-stage1-kit',
        'Matches factory Flathead fueling constraints with 12V conversion baseline.',
        'https://internal.docs/flathead-stage1#vehicle-fit',
        0.92
      ),
      (
        'VehicleProfile',
        '1956-tri-five-belair',
        'KitBundle',
        'tri-five-stage2-kit',
        'Tri-Five Sport Coupe baseline qualifies for Stage 2 performance upgrade.',
        'https://internal.docs/trifive-stage2#vehicle-fit',
        0.88
      ),
      (
        'UseCaseModifier',
        'mountain-tow',
        'KitBundle',
        'tri-five-stage2-kit',
        'Adds cooling & jet adjustments for high-altitude towing scenarios.',
        'https://internal.docs/trifive-stage2#mountain-tow',
        0.67
      ),
      (
        'KitBundle',
        'flathead-stage1-kit',
        'ConflictRule',
        'flathead-12v-retrofit',
        'Stage 1 kit requires 12V-ready electrical system to avoid regulator damage.',
        'https://internal.docs/flathead-stage1#conflicts',
        0.75
      ),
      (
        'KitBundle',
        'tri-five-stage2-kit',
        'ConflictRule',
        'trifive-fuel-pressure',
        'High-flow pump cannot run with stock fuel lines; prompt harness upgrade.',
        'https://internal.docs/trifive-stage2#conflicts',
        0.9
      )
    ON CONFLICT (from_type, from_slug, to_type, to_slug) DO UPDATE
      SET
        rationale = EXCLUDED.rationale,
        evidence_link = EXCLUDED.evidence_link,
        weight = EXCLUDED.weight,
        updated_at = NOW();
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'seo_cwv_opportunities'
  ) THEN
    INSERT INTO public.seo_cwv_opportunities (
      report_date,
      normalized_path,
      device_category,
      metric_driver,
      rank_band,
      sessions_delta,
      conversion_rate,
      average_order_value,
      expected_revenue_lift,
      confidence,
      ease_score,
      brand_excluded,
      low_signal
    ) VALUES
      (
        CURRENT_DATE - INTERVAL '1 day',
        '/kits/flathead-stage1',
        'desktop',
        'LCP',
        '4-6',
        420,
        0.0210,
        186.45,
        1643.94,
        0.72,
        0.55,
        FALSE,
        FALSE
      ),
      (
        CURRENT_DATE - INTERVAL '1 day',
        '/kits/tri-five-stage2',
        'mobile',
        'INP',
        '7-10',
        310,
        0.0185,
        204.10,
        1168.30,
        0.61,
        0.48,
        FALSE,
        TRUE
      )
    ON CONFLICT (report_date, normalized_path, device_category, metric_driver) DO UPDATE
      SET
        sessions_delta = EXCLUDED.sessions_delta,
        conversion_rate = EXCLUDED.conversion_rate,
        average_order_value = EXCLUDED.average_order_value,
        expected_revenue_lift = EXCLUDED.expected_revenue_lift,
        confidence = EXCLUDED.confidence,
        ease_score = EXCLUDED.ease_score,
        brand_excluded = EXCLUDED.brand_excluded,
        low_signal = EXCLUDED.low_signal,
        updated_at = NOW();
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'seo_cwv_backtests'
  ) THEN
    INSERT INTO public.seo_cwv_backtests (
      report_date,
      normalized_path,
      device_category,
      metric_driver,
      expected_revenue_lift,
      observed_revenue_lift,
      absolute_error,
      mae_window_days,
      sample_sessions,
      notes
    ) VALUES
      (
        CURRENT_DATE - INTERVAL '1 day',
        '/kits/flathead-stage1',
        'desktop',
        'LCP',
        1643.94,
        1502.10,
        141.84,
        14,
        520,
        'Backtest sample for dev tile parity'
      ),
      (
        CURRENT_DATE - INTERVAL '1 day',
        '/kits/tri-five-stage2',
        'mobile',
        'INP',
        1168.30,
        980.55,
        187.75,
        14,
        410,
        'Low-signal flagged; check ease mitigation'
      )
      ON CONFLICT DO NOTHING;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'ab_experiments'
  ) THEN
    INSERT INTO public.ab_experiments (
      experiment_key,
      status,
      primary_metric,
      min_effect_pct,
      ga4_dimension,
      cookie_name
    ) VALUES (
      'pdp_hero_copy_q4', 'running', 'atc_rate', 5, 'ab_variant', '__ab_variant'
    ) ON CONFLICT (experiment_key) DO UPDATE
      SET status = EXCLUDED.status,
          primary_metric = EXCLUDED.primary_metric,
          min_effect_pct = EXCLUDED.min_effect_pct,
          ga4_dimension = EXCLUDED.ga4_dimension,
          cookie_name = EXCLUDED.cookie_name,
          updated_at = NOW()
      RETURNING id INTO exp_id_flathead;

    INSERT INTO public.ab_experiments (
      experiment_key,
      status,
      primary_metric,
      min_effect_pct,
      ga4_dimension,
      cookie_name
    ) VALUES (
      'cart_trust_badges_v1', 'planned', 'checkout_start_rate', 3, 'ab_variant', '__ab_variant'
    ) ON CONFLICT (experiment_key) DO UPDATE
      SET status = EXCLUDED.status,
          primary_metric = EXCLUDED.primary_metric,
          min_effect_pct = EXCLUDED.min_effect_pct,
          ga4_dimension = EXCLUDED.ga4_dimension,
          cookie_name = EXCLUDED.cookie_name,
          updated_at = NOW()
      RETURNING id INTO exp_id_cart;

    INSERT INTO public.ab_arms (experiment_id, arm_id, rollout)
    VALUES
      (exp_id_flathead, 'control', 0.5),
      (exp_id_flathead, 'variant_a', 0.5)
    ON CONFLICT (experiment_id, arm_id) DO UPDATE
      SET rollout = EXCLUDED.rollout;

    INSERT INTO public.ab_arms (experiment_id, arm_id, rollout)
    VALUES
      (exp_id_cart, 'control', 0.5),
      (exp_id_cart, 'variant_a', 0.5)
    ON CONFLICT (experiment_id, arm_id) DO UPDATE
      SET rollout = EXCLUDED.rollout;

    INSERT INTO public.ab_assignments (experiment_id, visitor_id, arm_id, session_id, source)
    VALUES
      (exp_id_flathead, 'visitor_123', 'control', 'sess-abc', 'seed'),
      (exp_id_flathead, 'visitor_987', 'variant_a', 'sess-def', 'seed')
    ON CONFLICT (experiment_id, visitor_id) DO UPDATE
      SET arm_id = EXCLUDED.arm_id,
          session_id = EXCLUDED.session_id,
          source = EXCLUDED.source,
          assigned_at = NOW();

    INSERT INTO public.ab_exposures (experiment_id, assignment_id, visitor_id, arm_id, context)
    SELECT exp_id_flathead,
           id,
           visitor_id,
           arm_id,
           jsonb_build_object('route','/products/flathead-kit')
    FROM public.ab_assignments
    WHERE experiment_id = exp_id_flathead
      AND visitor_id IN ('visitor_987','visitor_123')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.ab_outcomes (experiment_id, visitor_id, arm_id, metric_key, metric_value)
    VALUES
      (exp_id_flathead, 'visitor_987', 'variant_a', 'add_to_cart', 1),
      (exp_id_flathead, 'visitor_123', 'control', 'add_to_cart', 0)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

COMMIT;
