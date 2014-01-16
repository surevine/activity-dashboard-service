activity-dashboard-service
==========================

Node.js web service to provide realtime data for [surevine/activity-dashboard-plugin](https://github.com/surevine/activity-dashboard-plugin).

## Requirements

* Nodejs v0.10.x

## Configuration

Copy `config.example.js` to `config.<ENVIRONMENT>.js`. Edit settings as required.

## Installation

Install dependencies:
```bash
npm install .
```

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
