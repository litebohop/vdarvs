# Overview

## Purpose

VDARVS digitizes village-level administration for Lesotho local government. It is built as a **production-quality prototype**: the UI, architecture, and data layer are structured so backend logic can grow without rewrites.

## Country and context

- **Country:** Lesotho
- **Address model:** Village-based (no street names or house numbers)
- **Address fields:** Village, Community Council (optional), District, P.O. Box (optional)
- **Central role:** Village Chiefs approve workflows and verify residency

## Administrative hierarchy

```
Country
  └── District
        └── Community Council
              └── Village
                    └── Village Chief
                          └── Citizen
```

## Target users

| Role | Responsibility |
|------|----------------|
| Citizen | View personal records, submit requests |
| Village Staff | Manage village administrative records |
| Village Chief | Approve workflows, verify residency |
| District Officer | District-level oversight and reports |
| Administrator | Full system access and configuration |

## Core workflows

The system is designed to support:

- Citizen registration
- Residency verification
- Land records
- Animal registration
- Dispute resolution
- Official documents and approvals
- Reports and statistics
- Notifications
- Audit logs

## Design goals

- Modern government dashboard aesthetic (clean typography, generous whitespace)
- Strict separation of UI, hooks, services, and data access
- Realistic Lesotho geography and names in seed data
- Every page has skeleton, empty, error, and success states
- Role-based navigation and route protection
