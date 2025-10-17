# Metaobjects — Content Models

Define these metaobjects and enable **Storefront access** and **Publish entries as web pages**:

1. `vehicle_model_year`
   - `make` (string), `model` (string), `year` (int), `notes` (richtext), `image` (media)
2. `swap_recipe`
   - `engine_family` (enum), `fuel_type` (enum), `pressure_psi` (int), `line_size` (enum), `regulator_type` (enum), `diagram` (media)
3. `compatibility_fact`
   - `platform` (string), `oem_fitting` (string), `thread` (string), `an_size` (enum), `torque_spec` (string), `photo` (media)
4. `howto_guide`
   - `title` (string), `summary` (string), `steps` (richtext), `tools` (list), `safety` (richtext), `related_products` (list of product refs)

**Relations:** `swap_recipe` links to many `compatibility_fact` and references `vehicle_model_year`.

**Routing:** Programmatic pages are routed under descriptive slugs, e.g. `/guides/ls-swap/{year}-{make}-{model}-fuel-system`.
