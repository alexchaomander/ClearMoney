# Rollback Runbook

Procedures for rolling back deployments when issues are detected post-deploy.

---

## API (Railway)

### Quick rollback via Railway dashboard
1. Go to [Railway dashboard](https://railway.app/dashboard) and select the `strata-api` service.
2. Navigate to **Deployments**.
3. Find the last known-good deployment and click **Redeploy**.
4. Verify health: `curl https://<api-domain>/api/v1/health`

### Rollback via CLI
```bash
# List recent deployments
railway deployments list --service strata-api

# Redeploy a specific deployment
railway redeploy <deployment-id> --service strata-api
```

### Database migration rollback
If the deployment included a bad Alembic migration:
```bash
cd packages/strata-api

# Check current revision
alembic current

# Downgrade one step
alembic downgrade -1

# Or downgrade to a specific revision
alembic downgrade <revision_id>
```

**Always test migration rollbacks on staging first.**

---

## Web (Vercel)

### Quick rollback via Vercel dashboard
1. Go to [Vercel dashboard](https://vercel.com/dashboard) and select the `web` project.
2. Navigate to **Deployments**.
3. Find the last known-good production deployment, click the three-dot menu, and select **Promote to Production**.

### Rollback via CLI
```bash
# List recent deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url>
```

---

## Post-Rollback Checklist

- [ ] Verify health endpoints are green
- [ ] Check Sentry for new errors
- [ ] Notify the team in Slack with rollback reason
- [ ] Create a post-mortem issue if the rollback was due to a bug
- [ ] Ensure the bad commit is reverted or fixed before next deploy
