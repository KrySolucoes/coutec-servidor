FROM node:14.15.4 as build
RUN npm i -g @angular/cli@12.1.4
WORKDIR /app
COPY ./app/package*.json ./
RUN npm i
COPY ./app .
RUN ng build --configuration production --output-hashing none
RUN cd dist && ls
RUN cd dist/coutec && ls
