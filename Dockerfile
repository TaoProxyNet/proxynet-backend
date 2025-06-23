# Stage 1: Build Stage (Using node:18 for building the application)
FROM node:18 AS build

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app (e.g., for TypeScript)
RUN npm run build

# Stage 2: Production Stage (Using Alpine for a smaller runtime image)
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Copy the .env files
COPY --from=build /app/.env ./
# COPY --from=build /app/.env.production ./
# COPY --from=build /app/.env.development ./

# Install only production dependencies
RUN npm install --only=production

# Expose the port
EXPOSE 9000

# Run the application
CMD ["node", "dist/index.js"]

# FROM node:18

# # Create app directory
# WORKDIR /app

# # Install app dependencies
# # A wildcard is used to ensure both package.json AND package-lock.json are copied
# # where available (npm@5+)
# COPY package*.json ./

# #RUN npm install pm2@latest -g
# RUN npm install
# # If you are building your code for production
# # RUN npm install --only=production

# # Bundle app source
# COPY . .

# # Set the working directory to the src directory
# WORKDIR /app/src

# # for typescript
# RUN npm run build


# WORKDIR /app

# EXPOSE 9000
# CMD ["node" ,"dist/index.js"]
