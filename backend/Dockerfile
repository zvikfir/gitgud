# Use a base Node.js image
FROM node:20-alpine

# Set the working directory for backend
WORKDIR /opt/gitgud/backend

# Copy backend package.json and install dependencies
COPY ./package*.json ./
RUN npm install --verbose
COPY . .

# Expose ports (adjust as needed)
EXPOSE 3000 9229

# Start the backend in development mode
CMD ["npm", "start"]
