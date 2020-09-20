# NodeJS Deployment to DigitalOcean

## Step 1: Update linux packages
```
$ sudo apt update
```

## Step 2: Install Node/NPM
```
$ sudo apt install nodejs

$ node -v
$ npm -v
```

## Step 3: Clone Repo
```
$ mkdir apps
$ cd apps
$ sudo git clone https://github.com/TVYDev/dev_camper_api.git

$ npm start
```
- By running with `npm start`, the app will be terminated once the terminal is closed. So we need a NodeJS process manager, to keep the application running all the time.

## Step 4: Install PM2 (Production Process Manager for Node.js)
>https://pm2.keymetrics.io/
```
$ npm i -g pm2

# Start application
$ pm2 start server.js

# Check status application
$ pm2 status server

# Restart application
$ pm2 restart server

# Stop application
$ pm2 stop server

# Start application from droplet reboot
$ pm2 startup server
```

## Step 5: Install Nginx
```
$ sudo apt install nginx
```

## Step 6: Set up firewall
```
$ sudo ufw enable

$ sudo ufw status

$ sudo ufw allow ssh

$ sudo ufw allow http

$ sudo ufw allow https
```

