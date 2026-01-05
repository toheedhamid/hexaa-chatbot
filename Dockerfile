# Use official n8n image
FROM n8nio/n8n:latest

# Set working directory
WORKDIR /data

# Copy workflow files
COPY n8n_workflows/ /data/n8n_workflows/

# Copy scripts directly to final location
# Use --chmod to set permissions during copy (BuildKit feature)
COPY --chmod=755 scripts/docker-entrypoint.sh /data/docker-entrypoint.sh
COPY --chmod=644 scripts/import-workflows.js /data/scripts/import-workflows.js

# Expose the default n8n port
EXPOSE 5678

# Use custom entrypoint that imports workflows
ENTRYPOINT ["/data/docker-entrypoint.sh"]
