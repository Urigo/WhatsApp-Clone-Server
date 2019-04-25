"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const di_1 = require("@graphql-modules/di");
const typeorm_1 = require("typeorm");
const User_1 = require("../../../entity/User");
const bcrypt_nodejs_1 = __importDefault(require("bcrypt-nodejs"));
const apollo_server_express_1 = require("apollo-server-express");
let AuthProvider = class AuthProvider {
    constructor(connection, pubsub) {
        this.connection = connection;
        this.pubsub = pubsub;
    }
    onRequest({ session }) {
        if ('req' in session) {
            this.currentUser = session.req.user;
        }
    }
    async onConnect(connectionParams) {
        if (connectionParams.authToken) {
            // Create a buffer and tell it the data coming in is base64
            const buf = Buffer.from(connectionParams.authToken.split(' ')[1], 'base64');
            // Read it back out as a string
            const [username, password] = buf.toString().split(':');
            const user = await this.signIn(username, password);
            if (user) {
                // Set context for the WebSocket
                this.currentUser = user;
            }
            else {
                throw new Error('Wrong credentials!');
            }
        }
        else {
            throw new Error('Missing auth token!');
        }
    }
    getUserByUsername(username) {
        return this.connection.getRepository(User_1.User).findOne({ where: { username } });
    }
    async signIn(username, password) {
        const user = await this.getUserByUsername(username);
        if (user && this.validPassword(password, user.password)) {
            return user;
        }
        else {
            return false;
        }
    }
    async signUp(username, password, name) {
        const userExists = !!(await this.getUserByUsername(username));
        if (!userExists) {
            const user = this.connection.manager.save(new User_1.User({
                username,
                password: this.generateHash(password),
                name,
            }));
            this.pubsub.publish('userAdded', {
                userAdded: user,
            });
            return user;
        }
        else {
            return false;
        }
    }
    generateHash(password) {
        return bcrypt_nodejs_1.default.hashSync(password, bcrypt_nodejs_1.default.genSaltSync(8));
    }
    validPassword(password, localPassword) {
        return bcrypt_nodejs_1.default.compareSync(password, localPassword);
    }
};
AuthProvider = __decorate([
    di_1.Injectable({
        scope: di_1.ProviderScope.Session
    }),
    __metadata("design:paramtypes", [typeorm_1.Connection,
        apollo_server_express_1.PubSub])
], AuthProvider);
exports.AuthProvider = AuthProvider;
