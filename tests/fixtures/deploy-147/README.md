# DEPLOY-147 Test Fixtures

These fixtures support QA approval flow testing for the CX Escalations modal with template suggestions and telemetry tracking.

## Files Overview

### `chatwoot-escalations.json`

Mock Chatwoot conversations representing various escalation scenarios:

- **ID 201**: Standard escalation with high-confidence template suggestion
- **ID 202**: Refund request with suggested template
- **ID 203**: Low-confidence scenario requiring manual review
- **ID 204**: High-value case requiring manager escalation

### `chatwoot-templates.json`

Template library for suggested replies:

- `ship_update`: Shipping status updates
- `refund_offer`: Refund/store credit options
- `ack_delay`: Acknowledgment of delays
- `escalation_manager`: Manager escalation template

### `decision-scenarios.json`

Test scenarios mapping conversations to expected user flows:

- Template suggestion available (high confidence)
- Low confidence suggestion warnings
- No suggestion available (manual required)
- Manager escalation required

### `telemetry-expectations.json`

Expected telemetry events and schema for decision tracking:

- Event schema validation
- Expected event sequences for each scenario
- Properties validation for decision logging

## Usage in Tests

These fixtures enable testing of:

1. Template suggestion display logic
2. Confidence threshold handling
3. Escalation workflow triggers
4. Telemetry event emission
5. Decision log creation

Import in Playwright tests to mock Chatwoot API responses and validate modal behavior against expected decision paths.
