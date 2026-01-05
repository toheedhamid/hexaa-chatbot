# Use official n8n image
FROM n8nio/n8n:latest

# Set working directory
WORKDIR /data

# Expose the default n8n port
EXPOSE 5678

# The official image already has the correct entrypoint
# It will use the environment variables you set in Railway
