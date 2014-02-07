activity-dashboard-service
==========================

Node.js web service to provide realtime data for [surevine/activity-dashboard-plugin](https://github.com/surevine/activity-dashboard-plugin).

## Requirements

* Nodejs v0.10.x
* npm

## Installation

Install dependencies:
```bash
cd /path/to/project/directory
npm install .
```

If you wish to use the npm start/stop scripts, install the `forever` package:
```bash
sudo npm i -g forever
```

## Configuration

Copy `config.example.js` to `config.<ENVIRONMENT>.js`, where `<ENVIRONMENT>` equals the NODE_ENV environment variable (usually 'production' or 'development'). e.g. `config.development.js`.

Edit settings as required (documented in config file).

## Usage

To start the service:
```bash
`node app.js`
```

To start the service with forever:
```bash
`npm start`
```

To stop a process started with forever:
```bash
`npm stop`
```

To restart a process started with forever:
```bash
`npm restart`
```

## Demo

A deployment can be viewed at https://www.surevine.com/activity-dashboard/
