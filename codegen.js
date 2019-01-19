require('ts-node/register/transpile-only');

const modules = {
  overwrite: true,
  schema: "./schema.ts",
  documents: null,
  require: [
    "ts-node/register/transpile-only",
  ],
  generates: {},
};

const { AppModule } = require ('./modules/app.module');

AppModule.forRoot({}).selfImports.forEach(module => {
  modules.generates[`./types/${module.name.toLowerCase()}.d.ts`] = {
    config: {
      optionalType: "undefined | null",
      contextType: `ModuleContext<I${module.name}ModuleContext>`,
      mappers: {
        "Chat": "../entity/Chat#Chat",
        "Message": "../entity/Message#Message",
        "Recipient": "../entity/Recipient#Recipient",
        "User": "../entity/User#User",
      },
    },
    plugins: [
      {
        "add": `
              import { ModuleContext } from '@graphql-modules/core';
              import { I${module.name}ModuleContext } from '../modules/${module.name.toLowerCase()}/index';
        `
      },
      "typescript-common",
      "typescript-server",
      "typescript-resolvers",
    ],
  };
});

module.exports = modules;
