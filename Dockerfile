ARG VERSION=latest

FROM n8nio/n8n:${VERSION}

LABEL org.opencontainers.image.source="https://github.com/victhille/n8n-fr"
LABEL org.opencontainers.image.description="n8n avec l'interface en français (traduction communautaire)"
LABEL org.opencontainers.image.licenses="MIT"

ENV N8N_DEFAULT_LOCALE=fr

# Replace the editor with the one built with the French texts
USER root
RUN rm -rf /usr/local/lib/node_modules/n8n/node_modules/n8n-editor-ui/dist
COPY ./editor-ui-dist /usr/local/lib/node_modules/n8n/node_modules/n8n-editor-ui/dist
USER node
