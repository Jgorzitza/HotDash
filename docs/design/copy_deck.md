---
epoch: 2025.10.E1
doc: docs/design/copy_deck.md
owner: designer
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-20
---
# Copy Deck — Operator Control Center

## Localized Strings (EN/FR)

### Dashboard Page

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `page.title` | Operator Control Center | Centre de contrôle opérateur |
| `page.mock_mode_notice` | Displaying sample data. Set `DASHBOARD_USE_MOCK=0` or append `?mock=0` to load live integrations. | Affichage de données d'exemple. Définissez `DASHBOARD_USE_MOCK=0` ou ajoutez `?mock=0` pour charger les intégrations en direct. |

### Tile Headings

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `tile.sales.heading` | Sales Pulse | Pouls des ventes |
| `tile.fulfillment.heading` | Fulfillment Health | État d'exécution |
| `tile.inventory.heading` | Inventory Heatmap | Carte thermique d'inventaire |
| `tile.escalations.heading` | CX Escalations | Escalades CX |
| `tile.seo.heading` | SEO & Content Watch | Veille SEO et contenu |

### Status Labels

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `status.healthy` | Healthy | En bonne santé |
| `status.attention` | Attention needed | Attention requise |
| `status.unconfigured` | Configuration required | Configuration requise |
| `status.error` | Error | Erreur |

### Tile Summaries

#### Sales Pulse

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `tile.sales.orders_count` | {count} orders in the current window. | {count} commandes dans la période actuelle. |
| `tile.sales.top_skus` | Top SKUs | Meilleurs SKU |
| `tile.sales.open_fulfillment` | Open fulfillment | Exécution ouverte |
| `tile.sales.no_blockers` | No fulfillment blockers detected. | Aucun bloqueur d'exécution détecté. |

#### Fulfillment Health

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `tile.fulfillment.all_on_track` | All recent orders are on track. | Toutes les commandes récentes sont en bonne voie. |
| `tile.fulfillment.since` | since {datetime} | depuis {datetime} |

#### Inventory Heatmap

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `tile.inventory.units_left` | {count} left | {count} restants |
| `tile.inventory.days_of_cover` | {days} days of cover | {days} jours de couverture |
| `tile.inventory.no_alerts` | No low stock alerts right now. | Aucune alerte de stock faible pour le moment. |

#### CX Escalations

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `tile.escalations.sla_breached` | SLA breached | SLA dépassé |
| `tile.escalations.no_breaches` | No SLA breaches detected. | Aucun dépassement de SLA détecté. |
| `tile.escalations.status_open` | open | ouvert |
| `tile.escalations.status_pending` | pending | en attente |

#### SEO & Content Watch

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `tile.seo.sessions` | {count} sessions | {count} sessions |
| `tile.seo.wow_delta` | {percent}% WoW | {percent}% SàS |
| `tile.seo.attention` | attention | attention |
| `tile.seo.stable` | Traffic trends stable. | Tendances de trafic stables. |

### Action CTAs

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `cta.view_details` | View Details | Voir les détails |
| `cta.take_action` | Take Action | Prendre des mesures |
| `cta.view_reply` | View & Reply | Voir et répondre |
| `cta.configure` | Configure Integration | Configurer l'intégration |
| `cta.retry` | Retry | Réessayer |
| `cta.cancel` | Cancel | Annuler |
| `cta.confirm` | Confirm Action | Confirmer l'action |
| `cta.approve_send` | Approve & Send Reply | Approuver et envoyer la réponse |
| `cta.edit_reply` | Edit Reply | Modifier la réponse |
| `cta.escalate` | Escalate to Manager | Escalader au gestionnaire |
| `cta.mark_resolved` | Mark Resolved | Marquer comme résolu |
| `cta.log_follow_up` | Log follow-up | À définir (marketing) |
| `cta.escalate_ops` | Escalate to ops | À définir (marketing) |
| `cta.create_po` | Create Draft PO | Créer un bon de commande brouillon |
| `cta.adjust_quantity` | Adjust Quantity | Ajuster la quantité |
| `cta.mark_intentional` | Mark as Intentional | Marquer comme intentionnel |
| `cta.snooze` | Snooze Alert | Reporter l'alerte |
| `cta.dismiss` | Dismiss | Fermer |

### Empty States

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `empty.generic` | Data unavailable right now. | Données actuellement indisponibles. |
| `empty.unconfigured` | Connect integration to enable this tile. | Connectez l'intégration pour activer cette tuile. |
| `empty.no_data` | No data to display. | Aucune donnée à afficher. |

### Error Messages

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `error.network` | Unable to load data. Network error. | Impossible de charger les données. Erreur réseau. |
| `error.rate_limit` | API rate limit exceeded. | Limite de débit de l'API dépassée. |
| `error.permission` | Insufficient permissions to view this data. | Permissions insuffisantes pour voir ces données. |
| `error.generic` | Something went wrong. Please try again. | Une erreur s'est produite. Veuillez réessayer. |

### Toast Notifications

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `toast.success.reply_sent` | Reply sent to {customer}. | Réponse envoyée à {customer}. |
| `toast.success.decision_logged` | Decision logged to audit trail. | Décision enregistrée dans le journal d'audit. |
| `toast.success.po_created` | Purchase order created successfully. | Bon de commande créé avec succès. |
| `toast.success.action_confirmed` | Escalation sent to customer.support@hotrodan.com. | Escalade envoyée à customer.support@hotrodan.com. |
| `toast.success.escalation_ticket` | Ticket #{ticketId} added to the audit trail. | Ticket #{ticketId} ajouté au journal d'audit. |
| `toast.error.action_failed` | Action Failed | Action échouée |
| `toast.error.network` | Unable to send reply. Network error. | Impossible d'envoyer la réponse. Erreur réseau. |
| `toast.error.retry_prompt` | Please try again. | Veuillez réessayer. |

### Modal Dialogs

#### CX Escalation Modal

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `modal.escalation.title` | CX Escalation — {customer} | Escalade CX — {customer} |
| `modal.escalation.status` | Status: {status} | Statut : {status} |
| `modal.escalation.priority` | Priority | Priorité |
| `modal.escalation.sla_breached` | SLA: Breached ({time} ago) | SLA : Dépassé (il y a {time}) |
| `modal.escalation.last_message` | Last Message: {time} ago | Dernier message : il y a {time} |
| `modal.escalation.conversation_preview` | Conversation Preview | Aperçu de la conversation |
| `modal.escalation.suggested_reply` | Suggested Reply (AI-generated): | Réponse suggérée (générée par IA) : |
| `modal.escalation.actions` | Actions: | Actions : |
| `modal.escalation.support_inbox` | Log decision to customer.support@hotrodan.com within 5 minutes. | Consignez la décision à customer.support@hotrodan.com dans les 5 minutes. |

#### Sales Pulse Modal

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `modal.sales.helper_support` | Variance alerts notify customer.support@hotrodan.com when they exceed 15%. | Les alertes de variance notifient customer.support@hotrodan.com lorsqu'elles dépassent 15 %. |
| `modal.sales.action_label` | What do you want to do? | Que souhaitez-vous faire ? |
| `modal.sales.action_follow_up` | Log follow-up | À définir (marketing) |
| `modal.sales.action_escalate` | Escalate to ops | À définir (marketing) |
| `modal.sales.notes_label` | Notes (audit trail) | Notes (journal d'audit) |
| `modal.sales.notes_helper` | Visible to operators and logged to the audit trail. | Visible pour les opérateurs et consigné dans le journal d'audit. |

#### Inventory Alert Modal

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `modal.inventory.title` | Inventory Alert — {product} | Alerte d'inventaire — {product} |
| `modal.inventory.sku` | SKU: {sku} | SKU : {sku} |
| `modal.inventory.current_stock` | Current Stock: {count} units | Stock actuel : {count} unités |
| `modal.inventory.threshold` | Threshold: {count} units | Seuil : {count} unités |
| `modal.inventory.days_of_cover` | Days of Cover: {days} days | Jours de couverture : {days} jours |
| `modal.inventory.velocity_analysis` | 14-Day Velocity Analysis | Analyse de vélocité sur 14 jours |
| `modal.inventory.avg_daily_sales` | Avg daily sales: {count} units | Ventes quotidiennes moy. : {count} unités |
| `modal.inventory.peak_day` | Peak day: {count} units ({date}) | Jour de pointe : {count} unités ({date}) |
| `modal.inventory.trend` | Trend: {trend} ({percent}% WoW) | Tendance : {trend} ({percent}% SàS) |
| `modal.inventory.trend_increasing` | Increasing | En hausse |
| `modal.inventory.trend_decreasing` | Decreasing | En baisse |
| `modal.inventory.trend_stable` | Stable | Stable |
| `modal.inventory.recommended_action` | Recommended Action: | Action recommandée : |
| `modal.inventory.reorder_qty` | Reorder Quantity: {count} units | Quantité de réapprovisionnement : {count} unités |
| `modal.inventory.lead_time` | Lead Time: {days} days | Délai de livraison : {days} jours |
| `modal.inventory.supplier` | Supplier: {name} | Fournisseur : {name} |

#### Confirmation Dialog

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `dialog.confirm_po.title` | Confirm Purchase Order | Confirmer le bon de commande |
| `dialog.confirm_po.description` | You're about to create a PO for: | Vous êtes sur le point de créer un bon de commande pour : |
| `dialog.confirm_po.units` | {count} units of {product} | {count} unités de {product} |
| `dialog.confirm_po.cost` | Estimated cost: {amount} | Coût estimé : {amount} |
| `dialog.confirm_po.supplier` | Supplier: {name} | Fournisseur : {name} |
| `dialog.confirm_po.audit_trail` | This action will be logged in the decision audit trail. | Cette action sera enregistrée dans le journal d'audit des décisions. |
| `dialog.confirm_po.confirm` | Confirm & Create | Confirmer et créer |

### Meta Information

| Key | EN (English) | FR (Français) |
|-----|--------------|---------------|
| `meta.last_refreshed` | Last refreshed {time} | Dernière actualisation {time} |
| `meta.source` | Source: {source} | Source : {source} |
| `meta.refreshing` | Refreshing... | Actualisation en cours... |
| `meta.time_ago.minutes` | {count} min ago | il y a {count} min |
| `meta.time_ago.hours` | {count}h ago | il y a {count}h |
| `meta.time_ago.days` | {count}d ago | il y a {count}j |

## Content Guidelines

### Tone & Voice

**English:**
- Professional but approachable
- Direct and action-oriented
- No jargon unless operator-familiar
- Confidence without arrogance

**French:**
- Professional ("vous" form for user addressing)
- Clear and actionable
- Consistent with Shopify French localization standards

### Formatting Conventions

#### Numbers
- **EN:** 1,234.56 (comma separator, period decimal)
- **FR:** 1 234,56 (space separator, comma decimal)

#### Currency
- **EN:** $1,234.56 USD
- **FR:** 1 234,56 $ USD

#### Dates/Times
- **EN:** Oct 5, 2025 at 2:30 PM
- **FR:** 5 oct. 2025 à 14h30

#### Percentages
- **EN:** -24% WoW (Week-over-Week)
- **FR:** -24% SàS (Semaine-à-Semaine)

### Character Limits

| Element | Max Length |
|---------|------------|
| Tile heading | 30 characters |
| CTA button | 25 characters |
| Status label | 20 characters |
| Toast message | 80 characters |
| Modal title | 50 characters |
| Empty state | 60 characters |

### Accessibility Notes

1. **Screen Reader Optimizations:**
   - Include full context in aria-labels
   - Avoid abbreviations in accessible names
   - Example: Visual "2m ago" → aria-label "Last refreshed 2 minutes ago"

2. **Icon + Text Pairing:**
   - Always pair icons with text labels
   - Example: "✓ Healthy" not just "✓"

3. **Error Context:**
   - Provide actionable next steps
   - Example: "Unable to load data. Network error. Please try again." (not just "Error")

## Implementation Format

### JSON Structure for i18n

```json
{
  "en": {
    "page": {
      "title": "Operator Control Center",
      "mock_mode_notice": "Displaying sample data. Set `DASHBOARD_USE_MOCK=0` or append `?mock=0` to load live integrations."
    },
    "tile": {
      "sales": {
        "heading": "Sales Pulse",
        "orders_count": "{count} orders in the current window.",
        "top_skus": "Top SKUs",
        "open_fulfillment": "Open fulfillment",
        "no_blockers": "No fulfillment blockers detected."
      }
    },
    "status": {
      "healthy": "Healthy",
      "attention": "Attention needed",
      "unconfigured": "Configuration required",
      "error": "Error"
    },
    "cta": {
      "view_details": "View Details",
      "take_action": "Take Action",
      "view_reply": "View & Reply"
    }
  },
  "fr": {
    "page": {
      "title": "Centre de contrôle opérateur",
      "mock_mode_notice": "Affichage de données d'exemple. Définissez `DASHBOARD_USE_MOCK=0` ou ajoutez `?mock=0` pour charger les intégrations en direct."
    },
    "tile": {
      "sales": {
        "heading": "Pouls des ventes",
        "orders_count": "{count} commandes dans la période actuelle.",
        "top_skus": "Meilleurs SKU",
        "open_fulfillment": "Exécution ouverte",
        "no_blockers": "Aucun bloqueur d'exécution détecté."
      }
    },
    "status": {
      "healthy": "En bonne santé",
      "attention": "Attention requise",
      "unconfigured": "Configuration requise",
      "error": "Erreur"
    },
    "cta": {
      "view_details": "Voir les détails",
      "take_action": "Prendre des mesures",
      "view_reply": "Voir et répondre"
    }
  }
}
```

## Handoff Notes

### For Engineer

1. **i18n Library:**
   - Use `react-intl` or `i18next` for string interpolation
   - Load locale from user preferences or browser settings
   - Fallback to English if French unavailable

2. **Dynamic Content:**
   - Use `{variable}` syntax for interpolation
   - Format numbers/dates per locale conventions
   - Handle pluralization (1 order vs 2 orders)

3. **Testing:**
   - Test both EN and FR on all screens
   - Verify text doesn't overflow at FR length (typically 30% longer)
   - Check right-to-left for future Arabic support consideration

4. **Translation Updates:**
   - New strings added to `locales/en.json` and `locales/fr.json`
   - Translation service reviews FR strings before merge
   - Version strings to track translation completeness
