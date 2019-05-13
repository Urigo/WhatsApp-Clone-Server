export interface RandomPhoto {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  description: string;
  alt_description: string;
  urls: Urls;
  links: RandomPhotoLinks;
  categories: any[];
  sponsored: boolean;
  sponsored_by: null;
  sponsored_impressions_id: null;
  likes: number;
  liked_by_user: boolean;
  current_user_collections: any[];
  user: User;
  exif: Exif;
  location: Location;
  views: number;
  downloads: number;
}

export interface Exif {
  make: string;
  model: null;
  exposure_time: null;
  aperture: string;
  focal_length: string;
  iso: null;
}

export interface RandomPhotoLinks {
  self: string;
  html: string;
  download: string;
  download_location: string;
}

export interface Location {
  title: string;
  name: string;
  city: string;
  country: string;
  position: Position;
}

export interface Position {
  latitude: number;
  longitude: number;
}

export interface Urls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
}

export interface User {
  id: string;
  updated_at: string;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  twitter_username: null;
  portfolio_url: string;
  bio: string;
  location: string;
  links: UserLinks;
  profile_image: ProfileImage;
  instagram_username: string;
  total_collections: number;
  total_likes: number;
  total_photos: number;
  accepted_tos: boolean;
}

export interface UserLinks {
  self: string;
  html: string;
  photos: string;
  likes: string;
  portfolio: string;
  following: string;
  followers: string;
}

export interface ProfileImage {
  small: string;
  medium: string;
  large: string;
}
