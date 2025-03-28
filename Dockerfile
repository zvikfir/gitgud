# Use a base Node.js image
FROM node:lts-alpine

# Set the working directory for backend
WORKDIR /opt/gitgud/backend

# Copy backend package.json and install dependencies
COPY ./backend/package.json ./
RUN npm install
COPY .backend .

# Set the working directory for frontend
WORKDIR /opt/gitgud/frontend

# Copy frontend package.json and install dependencies
COPY ./frontend/package.json ./
RUN npm install
COPY ./frontned .
#RUN npm run build

# Expose ports (adjust as needed)
EXPOSE 3000 9229

# Start the backend in development mode
CMD ["npm", "start"]
