# pull the official base image
FROM node:18-alpine
# set working direction
WORKDIR /app
# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH
# install application dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
# start app
CMD ["npm", "run", "start"]
