"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@graphql-modules/core");
const sonar_1 = require("@graphql-modules/sonar");
const typeorm_1 = require("typeorm");
const auth_provider_1 = require("./providers/auth.provider");
const app_symbols_1 = require("../app.symbols");
const apollo_server_express_1 = require("apollo-server-express");
const passport_1 = __importDefault(require("passport"));
const passport_http_1 = __importDefault(require("passport-http"));
const di_1 = require("@graphql-modules/di");
exports.AuthModule = new core_1.GraphQLModule({
    name: "Auth",
    providers: ({ config: { connection, app } }) => [
        { provide: typeorm_1.Connection, useValue: connection },
        { provide: app_symbols_1.APP, useValue: app },
        apollo_server_express_1.PubSub,
        auth_provider_1.AuthProvider,
    ],
    typeDefs: sonar_1.loadSchemaFiles(__dirname + '/schema/'),
    resolvers: sonar_1.loadResolversFiles(__dirname + '/resolvers/'),
    configRequired: true,
    middleware: di_1.InjectFunction(auth_provider_1.AuthProvider, app_symbols_1.APP)((authProvider, app) => {
        passport_1.default.use('basic-signin', new passport_http_1.default.BasicStrategy(async (username, password, done) => {
            done(null, await authProvider.signIn(username, password));
        }));
        passport_1.default.use('basic-signup', new passport_http_1.default.BasicStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
            const name = req.body.name;
            return done(null, !!name && await authProvider.signUp(username, password, name));
        }));
        app.post('/signup', passport_1.default.authenticate('basic-signup', { session: false }), (req, res) => res.json(req.user));
        app.use(passport_1.default.authenticate('basic-signin', { session: false }));
        app.post('/signin', (req, res) => res.json(req.user));
        return {};
    }),
});
