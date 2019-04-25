"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata"); // For TypeORM
require('dotenv').config();
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const http_1 = require("http");
const typeorm_1 = require("typeorm");
const db_1 = require("./db");
const app_module_1 = require("./modules/app.module");
typeorm_1.createConnection().then(async (connection) => {
    if (process.argv.includes('--add-sample-data')) {
        db_1.addSampleData(connection);
    }
    const PORT = 4000;
    const app = express_1.default();
    app.use(cors_1.default());
    app.use(body_parser_1.default.json());
    const { schema, context, subscriptions } = app_module_1.AppModule.forRoot({ connection, app, });
    const apollo = new apollo_server_express_1.ApolloServer({ schema, context, subscriptions });
    apollo.applyMiddleware({
        app,
        path: '/graphql'
    });
    // Wrap the Express server
    const ws = http_1.createServer(app);
    apollo.installSubscriptionHandlers(ws);
    ws.listen(PORT, () => {
        console.log(`Apollo Server is now running on http://localhost:${PORT}`);
    });
});
