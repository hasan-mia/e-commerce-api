# Use official Node.js image matching your engines field (Node 22)
FROM node:22

# Update package list and install FFmpeg
# RUN apt-get update && apt-get install -y ffmpeg

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the full app source code
COPY . .


# Expose the port your app runs on (according to your .env it's likely 3535)
EXPOSE 3535

# Start the app
CMD ["sh", "-c", "npm run migrate && npm run start"]
