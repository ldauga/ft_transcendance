FROM node:18-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
# start app
CMD ["npm", "start"]

# FROM node:18-alpine as build
# WORKDIR /app
# ENV PATH /app/node_modules/.bin:$PATH
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm i --silent
# RUN npm install react-scripts@3.4.1 -g --silent
# COPY . ./
# RUN npm run build

# FROM nginx:stable-alpine
# COPY --from=build /app/build /usr/share/nginx/html
# COPY proxy/conf/nginx.conf /etc/nginx/nginx.conf
# COPY proxy/certs/localhost.crt /etc/nginx/localhost.crt
# COPY proxy/certs/localhost.key /etc/nginx/localhost.key
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
