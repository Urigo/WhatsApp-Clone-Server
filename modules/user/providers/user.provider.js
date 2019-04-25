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
const apollo_server_express_1 = require("apollo-server-express");
const typeorm_1 = require("typeorm");
const User_1 = require("../../../entity/User");
const auth_provider_1 = require("../../auth/providers/auth.provider");
const cloudinary_1 = __importDefault(require("cloudinary"));
let UserProvider = class UserProvider {
    constructor(pubsub, connection, authProvider) {
        this.pubsub = pubsub;
        this.connection = connection;
        this.authProvider = authProvider;
        this.repository = this.connection.getRepository(User_1.User);
        this.currentUser = this.authProvider.currentUser;
    }
    createQueryBuilder() {
        return this.connection.createQueryBuilder(User_1.User, 'user');
    }
    getMe() {
        return this.currentUser;
    }
    getUsers() {
        return this.createQueryBuilder().where('user.id != :id', { id: this.currentUser.id }).getMany();
    }
    async updateUser({ name, picture, } = {}) {
        if (name === this.currentUser.name && picture === this.currentUser.picture) {
            return this.currentUser;
        }
        this.currentUser.name = name || this.currentUser.name;
        this.currentUser.picture = picture || this.currentUser.picture;
        await this.repository.save(this.currentUser);
        this.pubsub.publish('userUpdated', {
            userUpdated: this.currentUser,
        });
        return this.currentUser;
    }
    filterUserAddedOrUpdated(userAddedOrUpdated) {
        return userAddedOrUpdated.id !== this.currentUser.id;
    }
    uploadProfilePic(filePath) {
        return new Promise((resolve, reject) => {
            cloudinary_1.default.v2.uploader.upload(filePath, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
};
UserProvider = __decorate([
    di_1.Injectable(),
    __metadata("design:paramtypes", [apollo_server_express_1.PubSub,
        typeorm_1.Connection,
        auth_provider_1.AuthProvider])
], UserProvider);
exports.UserProvider = UserProvider;
