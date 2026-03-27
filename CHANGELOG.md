# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1.0] - 2026-03-27

### Added
- **Mini-Product Flywheel**: Launched standalone targeted calculators for viral acquisition.
- **Shot #1: Founder Runway & Burn Tester**: Standalone route at `/tools/founder-runway`.
- **Shot #3: AI Tax Shield Audit**: Standalone route at `/tools/tax-shield-audit` with document upload.
- **Sanitized Public API**: New endpoints at `/api/v1/public/audit/` for unauthenticated "Decision Trace" access.
- **UI Foundation**: New `ShotLayout`, `ShotHero`, and `ShotWorkspace` components following the "Advisor" (Approachable) theme.
- **Maintenance Mode**: Added `MaintenanceMiddleware` to gracefully handle system updates.
- **Key Rotation Script**: Added `app/scripts/rotate_keys.py` for automated database re-encryption.

### Changed
- Refactored `FounderRunway` page to use the new `ShotLayout` and `ShotHero`.
- Updated `StrataClient` in SDK to support new public audit methods.

### Fixed
- **P0 Security**: Scrubbed git history of sensitive `.env` files and rotated core encryption keys.
- Resolved missing `python-dateutil` and other dev dependencies in the API environment.
