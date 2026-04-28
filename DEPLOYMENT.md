# BlackCrest Enterprise Deployment

## Containerized Deployment

This platform can now be deployed as a portable enterprise container.

### Build the container

```bash
docker build -t blackcrest-platform .
```

### Run locally

```bash
docker run -p 3000:3000 --env-file .env blackcrest-platform
```

### Docker Compose

```bash
docker compose up --build
```

## Strategic Architecture Direction

Recommended long-term separation:

- Procurement Intelligence Engine
- API Gateway Layer
- Frontend UI Layer
- Licensing and Tenant Validation Layer
- Enterprise Connector Layer

## Licensing Direction

Future enterprise licensing can be enforced through:

- Tenant-aware authentication
- Enterprise deployment keys
- Usage metering
- Feature-tier controls
- White-label deployment profiles

## Enterprise Opportunities

The current architecture is suitable for:

- Private enterprise deployments
- Defense contractor internal environments
- Regional licensing models
- White-label procurement intelligence offerings
- Secure containerized deployments
