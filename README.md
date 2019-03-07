# Whatsapp Clone Server

[//]: # (head-end)


A full working server for a WhatsApp clone written in latest versions of:
* [NodeJS](https://github.com/nodejs/node)
* [Express](https://github.com/expressjs/express)
* [PostgreSQL](https://github.com/postgres/postgres)
* [GraphQL](https://github.com/graphql/graphql-js)
* [Typescript](https://github.com/microsoft/TypeScript)
* [Apollo-Server](https://github.com/apollographql/apollo-server)
* [GraphQL Code Generator](https://github.com/dotansimha/graphql-code-generator)
* [GraphQL Modules](https://github.com/urigo/graphql-modules)
* [Jest](https://github.com/facebook/jest)

This server constantly being updated by using CI tests and renovate.

You can watch this repository to learn about new updates or check out the git diffs between new versions on the [tutorial's version diff pages](https://www.tortilla.academy/Urigo/WhatsApp-Clone-Tutorial) (at the top of the screen).

It can be used as a boilerplate, a full blown example app and even as a [tutorial](https://github.com/Urigo/WhatsApp-Clone-Tutorial).

It also is being accompanied by a WhatsApp clone client app located in [this repository](https://github.com/Urigo/WhatsApp-Clone-Client-React).

## Running locally

Clone the project.

> the folder name is case sensitive, WhatsApp-Clone-Server with 'A' in whatsapp and 'S' in server

> if you want to use together with the [React Client](https://github.com/Urigo/WhatsApp-Clone-Client-React), make sure to name the folder by the default name of the repo `Whatsapp-Clone-Server` and make sure both projects are under the same folder.

Install dependencies:
```
$ yarn
```

Run the the codegen to generate Typescript types from GraphQL:
```
$ yarn codegen
```

Install PostgreSQL and initialize a database by following the instructions on [this chapter](https://www.tortilla.academy/Urigo/WhatsApp-Clone-Tutorial/master/next/step/14) (without the code diffs):

* With docker - PosgreSQL
```
docker run --name whatsapp-postgres -e POSTGRES_DB=whatsapp -e POSTGRES_USER=testuser -e POSTGRES_PASSWORD=testpassword --rm -p5432:5432 postgres
```
* Without docker - PostgreSQL commands to seed the test user with the following details:
```
user: 'testuser',
password: 'testpassword',
database: 'whatsapp',
```
```sh-session
$ psql postgres
$ create database whatsapp
$ create user testuser with encrypted password 'testpassword'
```

Run tests to make sure everything is ok:
```
$ yarn test
```

Start the server:
```
$ yarn start
```

If you want to use the ready React application with it, after finishing those steps, follow the instructions on the [React repo](https://github.com/Urigo/WhatsApp-Clone-Client-React).


This repository is using the Tortilla project for creating tutorials from real apps and git. For more information, see https://www.tortilla.academy/ and https://www.npmjs.com/package/tortilla.

### External contributors

* [sfabriece](https://github.com/sfabriece)
* [MStokluska](https://github.com/MStokluska)
* [gumyn](https://github.com/gumyn)


[//]: # (foot-start)

[{]: <helper> (navStep)

| [Begin Tutorial >](.tortilla/manuals/views/step1.md) |
|----------------------:|

[}]: #
