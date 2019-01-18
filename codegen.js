require('ts-node/register');

const modules = {
  overwrite: true,
  schema: "./schema.ts",
  documents: null,
  require: [
    "ts-node/register",
  ],
  generates: {},
};

const { AppModule } = require ('./modules/app.module');

AppModule.forRoot({}).selfImports.forEach(module => {
  modules.generates[`./types/${module.name.toLowerCase()}.d.ts`] = {
    config: {
      optionalType: "undefined | null",
      contextType: `../modules/${module.name.toLowerCase()}/index#I${module.name}ModuleContext`,
      mappers: {
        "Chat": "../entity/Chat#Chat",
        "Message": "../entity/Message#Message",
        "Recipient": "../entity/Recipient#Recipient",
        "User": "../entity/User#User",
      },
    },
    plugins: [
      "typescript-common",
      "typescript-server",
      "typescript-resolvers",
    ],
  };
});

module.exports = modules;
