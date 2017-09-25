FROM node:4.3.2

WORKDIR /home/app
ENV HOME=/home/app

COPY . .

RUN npm install

EXPOSE 4000
CMD [ "npm", "start" ]
