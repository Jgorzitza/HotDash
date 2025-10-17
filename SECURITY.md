# Security Policy

## Supported Versions

We actively maintain the production branch (`main`) and the most recent staging build. Fixes will be backported to prior releases only when a documented customer impact exists.

## Reporting a Vulnerability

- Email: security reports go to **justin@hotrodan.com**.
- Encryption: request a PGP key in the report if you need to send sensitive details.
- Please include reproduction steps, affected component, and any mitigation ideas.

We acknowledge reports within **1 business day** and provide a mitigation plan within **3 business days**. Critical issues trigger an immediate rollback or hotfix window.

## Out-of-Scope

- Archived documentation and fixtures under `docs/_archive/`
- Test data or sample payloads that use clearly fake credentials
- Denial-of-service attacks that require volumetric traffic beyond normal usage patterns

## Coordinated Disclosure

We prefer coordinated disclosure and will keep you informed of remediation progress. Once a fix is deployed, we will publish a postmortem in `docs/runbooks/security_incidents/` and notify affected stakeholders.
