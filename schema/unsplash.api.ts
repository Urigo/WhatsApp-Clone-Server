import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';
import { resolve } from 'path';
import { trackProvider } from '@safe-api/middleware';
import { RandomPhoto } from '../types/unsplash';

interface RandomPhotoInput {
  query: string;
  orientation: 'landscape' | 'portrait' | 'squarish';
}

export class UnsplashApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.unsplash.com/';
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set(
      'Authorization',
      'Client-ID 4d048cfb4383b407eff92e4a2a5ec36c0a866be85e64caafa588c110efad350d'
    );
  }

  async getRandomPhoto() {
    const trackedRandomPhoto = await trackProvider(
      ({ query, orientation }: RandomPhotoInput) =>
        this.get<RandomPhoto>('photos/random', { query, orientation }),
      {
        provider: 'Unsplash',
        method: 'RandomPhoto',
        location: resolve(__dirname, '../logs/main'),
      }
    );

    try {
      return (await trackedRandomPhoto({
        query: 'portrait',
        orientation: 'squarish',
      })).urls.small;
    } catch (err) {
      console.error('Cannot retrieve random photo:', err);
      return null;
    }
  }
}
