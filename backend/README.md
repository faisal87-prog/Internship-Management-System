# Backend

> **Status:** Not implemented. Placeholder structure only.

Django backend with Django REST Framework (to be added during implementation).

## Planned Structure

```
backend/
├── config/        # Django project settings (not implemented)
├── apps/
│   ├── accounts/      # Users, roles, authentication
│   ├── programs/      # Internship programs, intern profiles, skills
│   ├── roadmaps/      # Roadmap generation and publishing
│   ├── tasks/         # Tasks and task assignments
│   ├── submissions/   # Submissions and mentor reviews
│   └── reports/       # Weekly reports and final summaries
├── services/      # Business logic services (not implemented)
├── permissions/   # Role-based permissions (not implemented)
├── common/        # Shared utilities (not implemented)
└── tests/         # Test suite (not implemented)
```

## Rules

- All AI requests go through Django backend
- OpenAI API key stored in environment variable only
- Local media storage during MVP
- PostgreSQL database

## Documentation

See [../docs/](../docs/) for database design, architecture, and implementation order.
