FROM public.ecr.aws/skyslit/node:14.16-slim

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

RUN echo "deb http://archive.debian.org/debian stretch main" > /etc/apt/sources.list
RUN apt-get update -y
RUN apt-get install python -y
RUN apt-get install build-essential -y
RUN apt-get install curl -y

RUN curl "https://prod-compass-public-assets.s3.ap-south-1.amazonaws.com/binary-distributions/mongodb-database-tools-debian92-x86_64-100.8.0.deb" --output mongodb-database-tools-debian92-x86_64-100.8.0.deb
RUN apt-get install ./mongodb-database-tools-debian92-x86_64-100.8.0.deb -y

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

ENV NODE_PORT=80
EXPOSE 80

CMD ["node", "./build/server/main.js"]
