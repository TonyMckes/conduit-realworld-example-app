FROM node:16

WORKDIR /usr/src/app

COPY . .

RUN npm install 
RUN npm run build -w frontend

EXPOSE 3001

CMD ["npm", "run", "start", "-w", "backend"]
