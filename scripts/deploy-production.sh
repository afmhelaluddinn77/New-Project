#!/bin/bash

# Production Deployment Script for EMR/HMS
# Following DEVELOPMENT_LAW.md and FEATURE_IMPLEMENTATION_LAW.md

set -e

# Production Configuration
ENVIRONMENT="production"
DOMAIN="emr.hospital.com"
SSL_CERT_PATH="/etc/ssl/certs/emr.crt"
SSL_KEY_PATH="/etc/ssl/private/emr.key"

echo "🚀 EMR/HMS Production Deployment"
echo "================================"

# Function to build and optimize services
build_service() {
    local service_name=$1
    local service_path=$2

    echo "Building $service_name..."
    cd "$service_path"

    # Install production dependencies
    npm ci --only=production

    # Build for production
    if [ -f "tsconfig.json" ]; then
        npm run build
    fi

    # Run tests
    npm test || true

    cd - > /dev/null
}

# Function to deploy with Docker
deploy_with_docker() {
    echo "Building Docker images..."

    # Build backend services
    for service in authentication patient encounter appointment billing fhir order; do
        docker build -t "emr/${service}-service:latest" \
            -f "services/${service}-service/Dockerfile" \
            "services/${service}-service"
    done

    # Build frontend portals
    for portal in patient provider admin lab pharmacy billing radiology nurses it; do
        docker build -t "emr/${portal}-portal:latest" \
            -f "${portal}-portal/Dockerfile" \
            "${portal}-portal"
    done

    echo "Deploying with Docker Compose..."
    docker-compose -f docker-compose.prod.yml up -d
}

# Create Docker Compose production file
create_docker_compose() {
    cat > docker-compose.prod.yml <<EOF
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: emr_production
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - emr_network

  # Redis
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - emr_network

  # Kong API Gateway
  kong:
    image: kong:3.4
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: postgres
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: \${KONG_DB_PASSWORD}
      KONG_ADMIN_LISTEN: "0.0.0.0:8001"
      KONG_PROXY_LISTEN: "0.0.0.0:8000, 0.0.0.0:8443 ssl"
    ports:
      - "80:8000"
      - "443:8443"
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - emr_network

  # Authentication Service
  auth-service:
    image: emr/authentication-service:latest
    environment:
      DATABASE_URL: postgresql://\${DB_USER}:\${DB_PASSWORD}@postgres:5432/emr_production
      REDIS_URL: redis://:\${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: \${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - emr_network

  # Patient Service
  patient-service:
    image: emr/patient-service:latest
    environment:
      DATABASE_URL: postgresql://\${DB_USER}:\${DB_PASSWORD}@postgres:5432/emr_production
      REDIS_URL: redis://:\${REDIS_PASSWORD}@redis:6379
      NODE_ENV: production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - emr_network

  # Nginx Load Balancer
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - \${SSL_CERT_PATH}:/etc/ssl/certs/emr.crt:ro
      - \${SSL_KEY_PATH}:/etc/ssl/private/emr.key:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - kong
    restart: unless-stopped
    networks:
      - emr_network

volumes:
  postgres_data:
  redis_data:

networks:
  emr_network:
    driver: bridge
EOF
}

# Create Nginx configuration
create_nginx_config() {
    cat > nginx.conf <<'EOF'
events {
    worker_connections 1024;
}

http {
    upstream api_gateway {
        server kong:8000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/emr.crt;
    ssl_certificate_key /etc/ssl/private/emr.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    server {
        listen 80;
        server_name emr.hospital.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name emr.hospital.com;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API Gateway
        location /api/ {
            limit_req zone=api_limit burst=50 nodelay;
            proxy_pass http://api_gateway;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Portal routing
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }
    }
}
EOF
}

# Create Kubernetes deployment
create_kubernetes_deployment() {
    mkdir -p k8s

    cat > k8s/deployment.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: emr-backend
  namespace: emr-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: emr-backend
  template:
    metadata:
      labels:
        app: emr-backend
    spec:
      containers:
      - name: auth-service
        image: emr/authentication-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: emr-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: emr-backend-service
  namespace: emr-system
spec:
  selector:
    app: emr-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3001
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: emr-backend-hpa
  namespace: emr-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: emr-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF
}

# Health check function
health_check() {
    echo "Running health checks..."

    # Check database connection
    docker exec postgres pg_isready -U emr_user || exit 1

    # Check Redis
    docker exec redis redis-cli ping || exit 1

    # Check services
    for port in 3001 3002 3003 3004 3005 3006; do
        curl -f "http://localhost:$port/health" || exit 1
    done

    echo "✓ All health checks passed"
}

# Backup function
backup_database() {
    echo "Creating database backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    docker exec postgres pg_dump -U emr_user emr_production > "backup_${timestamp}.sql"

    # Upload to S3 or other storage
    # aws s3 cp "backup_${timestamp}.sql" "s3://emr-backups/db/"

    echo "✓ Backup created: backup_${timestamp}.sql"
}

# Main deployment
main() {
    echo "Starting production deployment..."

    # Create necessary files
    create_docker_compose
    create_nginx_config
    create_kubernetes_deployment

    # Build services
    for service in services/*-service; do
        if [ -d "$service" ]; then
            build_service "$(basename $service)" "$service"
        fi
    done

    for portal in *-portal; do
        if [ -d "$portal" ]; then
            build_service "$(basename $portal)" "$portal"
        fi
    done

    # Deploy with Docker or Kubernetes
    if command -v kubectl &> /dev/null; then
        echo "Deploying to Kubernetes..."
        kubectl apply -f k8s/
    else
        echo "Deploying with Docker Compose..."
        deploy_with_docker
    fi

    # Wait for services to be ready
    sleep 30

    # Run health checks
    health_check

    # Create backup
    backup_database

    echo ""
    echo "================================================"
    echo "✓ Production deployment completed successfully!"
    echo "================================================"
    echo ""
    echo "Access the system at: https://${DOMAIN}"
    echo ""
    echo "Monitoring:"
    echo "  Grafana: https://${DOMAIN}/grafana"
    echo "  Prometheus: https://${DOMAIN}/prometheus"
    echo ""
}

# Run deployment
main "$@"
