# Use a base Node.js image to build the frontend
FROM node:20-alpine AS build

# Set the working directory for frontend
WORKDIR /opt/gitgud/frontend

# Copy frontend package.json and install dependencies
COPY ./package*.json ./
RUN npm install --verbose
COPY ./src ./src
COPY ./public ./public

# Build the frontend
RUN npm run build

# Use a base nginx image to serve the frontend
FROM nginxinc/nginx-unprivileged:alpine

# Copy the built frontend from the build stage
COPY --from=build /opt/gitgud/frontend/build /usr/share/nginx/html

# Copy the nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Make create-env-config.sh executable and copy it
#COPY ./create-env-config.sh /docker-entrypoint.d/
#RUN chmod +x /docker-entrypoint.d/create-env-config.sh

# Expose port 80
EXPOSE 80

# Set environment variables
ENV REACT_APP_BASE_URL=""
ENV REACT_APP_API_SERVER=""
ENV PUBLIC_URL=""

# Start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
