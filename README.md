# ![RealWorld Example App](logo.png)

> ### React / Express.js / Sequelize / PostgreSQL codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://realworld.io/) spec and API.

### [Demo app](https://conduit-realworld-example-app.fly.dev/)&nbsp;&nbsp;|&nbsp;&nbsp;[RealWorld Example Apps](https://codebase.show/projects/realworld?category=fullstack)&nbsp;&nbsp;|&nbsp;&nbsp;![](https://heroku-status-badges.herokuapp.com/conduit-realworld-example-app)

This codebase was created to demonstrate a fully fledged fullstack application built with **React / Express.js / Sequelize / PostgreSQL** including CRUD operations, authentication, routing, pagination, and more.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.

## Prerequisites

- Make sure your have a Node.js (v14 or newer) installed.
- Make sure you have your database setup.

## Installation

Install all the npm dependencies with the following command:

```bash
npm install
```

## Development

### Configuration

In the [`backend`](backend/) directory, duplicate and remane the`.env.example` file, name it `.env`, and modify it to set all the required private development environment variables.

> Optionally you can run the following command to populate your database with some dummy data:

> ```bash
> npx -w backend sequelize-cli db:seed:all
> ```

### Starting the development server

Start the development environment with the following command:

```bash
npm run dev
```

- The frontend website should be available at [http://localhost:3000/](http://localhost:3000).

- The backend API should be available at [http://localhost:3001/api](http://localhost:3001/api).

### Testing

To run the tests, run the following command:

```bash
npm test
```

## Production

The following command will build the production version of the app:

```bash
npm start
```
