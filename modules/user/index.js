"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../../cloudinary.d.ts" />
const core_1 = require("@graphql-modules/core");
const sonar_1 = require("@graphql-modules/sonar");
const user_provider_1 = require("./providers/user.provider");
const auth_1 = require("../auth");
const multer_1 = __importDefault(require("multer"));
const tmp_1 = __importDefault(require("tmp"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const app_symbols_1 = require("../app.symbols");
const di_1 = require("@graphql-modules/di");
exports.CLOUDINARY_URL = process.env.CLOUDINARY_URL || '';
exports.UserModule = new core_1.GraphQLModule({
    name: 'User',
    imports: [
        auth_1.AuthModule,
    ],
    providers: [
        user_provider_1.UserProvider,
    ],
    defaultProviderScope: di_1.ProviderScope.Session,
    typeDefs: sonar_1.loadSchemaFiles(__dirname + '/schema/'),
    resolvers: sonar_1.loadResolversFiles(__dirname + '/resolvers/'),
    middleware: di_1.InjectFunction(user_provider_1.UserProvider, app_symbols_1.APP)((userProvider, app) => {
        const match = exports.CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/);
        if (match) {
            const [api_key, api_secret, cloud_name] = match.slice(1);
            cloudinary_1.default.config({ api_key, api_secret, cloud_name });
        }
        const upload = multer_1.default({
            dest: tmp_1.default.dirSync({ unsafeCleanup: true }).name,
        });
        app.post('/upload-profile-pic', upload.single('file'), async (req, res, done) => {
            try {
                res.json(await userProvider.uploadProfilePic(req.file.path));
            }
            catch (e) {
                done(e);
            }
        });
        return {};
    })
});
