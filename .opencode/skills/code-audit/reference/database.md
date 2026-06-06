# Database Audit Criteria

## Prisma ORM
- Prisma ORM used for all database operations?
- No raw SQL unless necessary?

## Migrations
- `prisma migrate dev` used (not `db push`)?
- `prisma migrate status` verified before committing?
- Production deployments run `prisma migrate deploy` before app starts?
