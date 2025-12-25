# RentBack Admin – Incident Runbook

## First checks
- Admin health: `/api/health`
- Vercel deployment logs (admin project)
- Supabase logs and RLS settings

## Common flows
- 5xx after deploy: consider rolling back to the last green build.
- Auth errors: confirm env (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) and session cookies.

## Rollback
- Vercel “Promote” the previous successful deployment.

## Contacts
- Security: security@rentback.app
- Ops: help@rentback.app

_Last updated: {{TODAY}}_
