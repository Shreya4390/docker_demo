To Build a Node.js Application with Docker on Ubuntu 20.04

# Step 1 — Installing Your Application Dependencies 


####  Create directory 
mkdir node_project

#### Navigate to this directory:
cd node_project

#### Create a package.json file
touch package.json

#### Add all dependencies like:
{
  "name": "nodejs-image-demo",
  "version": "1.0.0",
  "description": "nodejs image demo",
  "author": "Sammy the Shark <sammy@example.com>",
  "license": "MIT",
  "main": "app.js",
  "keywords": [
    "nodejs",
    "bootstrap",
    "express"
  ],
  "dependencies": {
    "express": "^4.16.4"
  }
}

#### To install your project’s dependencies, run the following command:
npm install


# Step 2 — Creating the Application Files


#### First, open app.js in the main project directory to define the project’s routes:
touch app.js

#### Create Express app
  const express = require('express');
const app = express();
const router = express.Router();
router.use(function (req, res, next) {
    console.log('/' + req.method);
    next();
});
const path = __dirname + '/views/';
const port = 4000;

router.get('/message', function (req, res) {
    res.json({msg:"Hello Sam welcome to team!"})
});

app.use(express.static(path));
app.use('/', router);

app.listen(port, function () {
    console.log('Example app listening on port 4000!')
})

#### If you followed the initial server setup tutorial in the prerequisites, you will have an active firewall permitting only SSH traffic. To permit traffic to  port 4000 run:
sudo ufw allow 4000

#### To start the application, make sure that you are in your project’s root directory:
cd ~/node_project

#### Start the application with node app.js:
node app.js

#### Navigate your browser to http://your_server_ip:4000

# Step 3 — Writing the Dockerfile

#### In your project’s root directory, create the Dockerfile:
touch Dockerfile

#### Add the following FROM instruction to set the application’s base image:
The alpine image is derived from the Alpine Linux project, and will help us keep our image size down. Alpine Linux is a Linux distribution built around musl libc and BusyBox. The image is only 5 MB in size and has access to a package repository that is much more complete than other BusyBox based images. This makes Alpine Linux a great image base for utilities and even production applications.

1. FROM node:10-alpine

This image includes Node.js and npm. Each Dockerfile must begin with a FROM instruction.

By default, the Docker Node image includes a non-root node user that you can use to avoid running your application container as root. It is a recommended security practice to avoid running containers as root and to restrict capabilities within the container to only those required to run its processes. We will therefore use the node user’s home directory as the working directory for our application and set them as our user inside the container.

2. RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app


set the working directory of the application to /home/node/app:

3. WORKDIR /home/node/app

Copy the package.json and package-lock.json (for npm 5+) files
 
4.  COPY package*.json ./

To ensure that all of the application files are owned by the non-root node user, including the contents of the node_modules directory, switch the user to node before running npm install

5. USER node
6. RUN npm install

Copy your application code with the appropriate permissions to the application directory on the container.

7. COPY --chown=node:node . .

expose port 8080 on the container and start the application.

8. EXPOSE 8080

9. CMD [ "node", "app.js" ]

##### Create .dockerignore file
touch .dockerignore

##### Add your local node modules, npm logs, Dockerfile, and .dockerignore file
 node_modules
 npm-debug.log
 Dockerfile
.dockerignore

##### You are now ready to build the application image using the docker build command. Using the -t flag with docker build will allow you to tag the image with a memorable name. Because we are going to push the image to Docker Hub, let’s include our Docker Hub username in the tag. We will tag the image as nodejs-image-demo. Also you can change image name as per your need.The . specifies that the build context is the current directory

sudo docker build -t your_dockerhub_username/nodejs-image-demo .


##### It will take a minute or two to build the image.

sudo docker images

##### You will receive the following output:
Output
REPOSITORY                                         TAG                 IMAGE ID            CREATED             SIZE
your_dockerhub_username/nodejs-image-demo          latest              1c723fb2ef12        8 seconds ago       73MB
node

##### It is now possible to create a container with this image using docker run. We will include three flags with this command:

-p: This publishes the port on the container and maps it to a port on our host. We will use port 80 on the host, but you should feel free to modify this as necessary if you have another process running on that port. 
-d: This runs the container in the background.
--name: This allows us to give the container a memorable name.

sudo docker run --name nodejs-image-demo -p 80:8080 -d your_dockerhub_username/nodejs-image-demo

##### Once your container is up and running, you can inspect a list of your running containers with docker ps.

sudo docker ps

##### You will receive the following output:

Output
CONTAINER ID        IMAGE                                                   COMMAND             CREATED             STATUS              PORTS                  NAMES
e50ad27074a7        your_dockerhub_username/nodejs-image-demo               "node app.js"       8 seconds ago       Up 7 seconds        0.0.0.0:80->8080/tcp   nodejs-image-demo


##### Now you can navigating your browser to your server IP without the port.

http://your_server_ip

# Step 4 — Using a Repository to Work with Images

##### The first step to pushing the image is to log in to the Docker Hub account you created in the prerequisites.

sudo docker login -u your_dockerhub_username 

##### You can now push the application image to Docker Hub using the tag you created earlier, your_dockerhub_username/nodejs-image-demo.

sudo docker push your_dockerhub_username/nodejs-image-demo

##### List your running containers.

sudo docker ps

##### You will get the following output.

Output
CONTAINER ID        IMAGE                                       COMMAND             CREATED             STATUS              PORTS                  NAMES
e50ad27074a7        your_dockerhub_username/nodejs-image-demo   "node app.js"       3 minutes ago       Up 3 minutes        0.0.0.0:80->8080/tcp   nodejs-image-demo

##### Using the CONTAINER ID listed in your output, stop the running application container. Be sure to replace the highlighted ID below with your own CONTAINER ID.

sudo docker stop e50ad27074a7

##### List your all of your images with the -a flag.

docker images -a

##### You will receive the following output with the name of your image, your_dockerhub_username/nodejs-image-demo, along with the node image and the other images from your build.

Output
REPOSITORY                                           TAG                 IMAGE ID            CREATED             SIZE
your_dockerhub_username/nodejs-image-demo            latest              1c723fb2ef12        7 minutes ago       73MB
<none>                                               <none>              2e3267d9ac02        4 minutes ago       72.9MB
<none>                                               <none>              8352b41730b9        4 minutes ago       73MB

##### Remove the stopped container and all of the images, including unused or dangling images, with the following command.

docker system prune -a

##### All of your images and containers deleted, you can now pull the application image from Docker Hub.

docker pull your_dockerhub_username/nodejs-image-demo 

##### List your images once again:

docker images

Output
REPOSITORY                                     TAG                 IMAGE ID            CREATED             SIZE
your_dockerhub_username/nodejs-image-demo      latest              1c723fb2ef12        11 minutes ago      73MB

##### You can now rebuild your container using the command from Step 3.

docker run --name nodejs-image-demo -p 80:8080 -d your_dockerhub_username/nodejs-image-demo

##### List your running containers:

docker ps

Output
CONTAINER ID        IMAGE                                                   COMMAND             CREATED             STATUS              PORTS                  NAMES
f6bc2f50dff6        your_dockerhub_username/nodejs-image-demo               "node app.js"       4 seconds ago       Up 3 seconds        0.0.0.0:80->8080/tcp   nodejs-image-demo

##### Now you can navigating your browser to your server IP without the port.

http://your_server_ip