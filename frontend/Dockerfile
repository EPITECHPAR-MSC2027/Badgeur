# Using one of the latest versions of Node.js
FROM node:25-alpine

# Set working directory
WORKDIR /app

# Copy the package.json and package.lock.json files inside the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of our application files
COPY . . 

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]