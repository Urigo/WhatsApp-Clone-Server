"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const app_module_1 = require("./modules/app.module");
exports.default = app_module_1.AppModule.forRoot({}).typeDefs;
