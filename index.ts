/// <reference path="./cloudinary.d.ts" />
require('dotenv').config();
import { schema } from "./schema";
import bodyParser from "body-parser";
import cors from 'cors';
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import cloudinary from 'cloudinary';
import multer from 'multer';
import tmp from 'tmp';

const PORT = 4000;
const CLOUDINARY_URL = process.env.CLOUDINARY_URL || '';

const app = express();

app.use(cors());
app.use(bodyParser.json());

const match = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(\w+)@(\.+)/);

if (match) {
  const [api_key, api_secret, cloud_name] = match.slice(1);
  cloudinary.config({ api_key, api_secret, cloud_name });
}

const upload = multer({
  dest: tmp.dirSync({ unsafeCleanup: true }).name,
});

app.post('/upload-profile-pic', upload.single('file'), async (req: any, res, done) => {
  try {
    res.json(await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(req.file.path, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
    }));
  } catch (e) {
    done(e);
  }
});

const apollo = new ApolloServer({
  schema
});

apollo.applyMiddleware({
  app,
  path: '/graphql'
});

app.listen(PORT);
