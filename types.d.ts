import { Chat as ChatEntity } from "./entity/Chat";
import { Message as MessageEntity } from "./entity/Message";
import { Recipient as RecipientEntity } from "./entity/Recipient";
import { User as UserEntity } from "./entity/User";
import { Upload } from "./upload";
export type Maybe<T> = T | undefined | null;

export interface CreateUserInput {
  username?: Maybe<string>;

  email?: Maybe<string>;

  password?: Maybe<string>;

  name?: Maybe<string>;

  picture?: Maybe<string>;

  phone?: Maybe<string>;
}

export interface TwoFactorSecretKeyInput {
  ascii?: Maybe<string>;

  base32?: Maybe<string>;

  hex?: Maybe<string>;

  qr_code_ascii?: Maybe<string>;

  qr_code_hex?: Maybe<string>;

  qr_code_base32?: Maybe<string>;

  google_auth_qr?: Maybe<string>;

  otpauth_url?: Maybe<string>;
}

export interface AuthenticateParamsInput {
  access_token?: Maybe<string>;

  access_token_secret?: Maybe<string>;

  provider?: Maybe<string>;

  password?: Maybe<string>;

  user?: Maybe<UserInput>;

  code?: Maybe<string>;
}

export interface UserInput {
  id?: Maybe<string>;

  email?: Maybe<string>;

  username?: Maybe<string>;
}

export enum MessageType {
  Location = "LOCATION",
  Text = "TEXT",
  Picture = "PICTURE"
}

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  twoFactorSecret?: Maybe<TwoFactorSecretKey>;

  getUser?: Maybe<User>;

  users?: Maybe<User[]>;

  chats: Chat[];

  chat?: Maybe<Chat>;
}

export interface TwoFactorSecretKey {
  ascii?: Maybe<string>;

  base32?: Maybe<string>;

  hex?: Maybe<string>;

  qr_code_ascii?: Maybe<string>;

  qr_code_hex?: Maybe<string>;

  qr_code_base32?: Maybe<string>;

  google_auth_qr?: Maybe<string>;

  otpauth_url?: Maybe<string>;
}

export interface User {
  id: string;

  emails?: Maybe<EmailRecord[]>;

  username?: Maybe<string>;

  name?: Maybe<string>;

  picture?: Maybe<string>;

  phone?: Maybe<string>;
}

export interface EmailRecord {
  address?: Maybe<string>;

  verified?: Maybe<boolean>;
}

export interface Chat {
  id: string;

  createdAt: Date;

  name?: Maybe<string>;

  picture?: Maybe<string>;

  allTimeMembers: User[];

  listingMembers: User[];

  actualGroupMembers?: Maybe<User[]>;

  admins?: Maybe<User[]>;

  owner?: Maybe<User>;

  isGroup: boolean;

  messages: (Maybe<Message>)[];

  lastMessage?: Maybe<Message>;

  updatedAt: Date;

  unreadMessages: number;
}

export interface Message {
  id: string;

  sender: User;

  chat: Chat;

  content: string;

  createdAt: Date;

  type: number;

  holders: User[];

  ownership: boolean;

  recipients: Recipient[];
}

export interface Recipient {
  user: User;

  message: Message;

  chat: Chat;

  receivedAt?: Maybe<Date>;

  readAt?: Maybe<Date>;
}

export interface Mutation {
  createUser?: Maybe<string>;

  verifyEmail?: Maybe<boolean>;

  resetPassword?: Maybe<LoginResult>;

  sendVerificationEmail?: Maybe<boolean>;

  sendResetPasswordEmail?: Maybe<boolean>;

  changePassword?: Maybe<boolean>;

  twoFactorSet?: Maybe<boolean>;

  twoFactorUnset?: Maybe<boolean>;

  impersonate?: Maybe<ImpersonateReturn>;

  refreshTokens?: Maybe<LoginResult>;

  logout?: Maybe<boolean>;

  authenticate?: Maybe<LoginResult>;

  updateUser: User;

  uploadPicture: UploadedFile;

  addChat?: Maybe<Chat>;

  addGroup?: Maybe<Chat>;

  updateGroup?: Maybe<Chat>;

  removeChat?: Maybe<string>;

  addAdmins: (Maybe<string>)[];

  removeAdmins: (Maybe<string>)[];

  addMembers: (Maybe<string>)[];

  removeMembers: (Maybe<string>)[];

  addMessage?: Maybe<Message>;

  removeMessages: (Maybe<string>)[];

  markAsReceived?: Maybe<boolean>;

  markAsRead?: Maybe<boolean>;
}

export interface LoginResult {
  sessionId?: Maybe<string>;

  tokens?: Maybe<Tokens>;
}

export interface Tokens {
  refreshToken?: Maybe<string>;

  accessToken?: Maybe<string>;
}

export interface ImpersonateReturn {
  authorized?: Maybe<boolean>;

  tokens?: Maybe<Tokens>;

  user?: Maybe<User>;
}

export interface UploadedFile {
  url: string;
}

export interface Subscription {
  userAdded?: Maybe<User>;

  userUpdated?: Maybe<User>;

  chatAdded?: Maybe<Chat>;

  chatUpdated?: Maybe<Chat>;

  messageAdded?: Maybe<Message>;
}

// ====================================================
// Arguments
// ====================================================

export interface ChatQueryArgs {
  chatId: string;
}
export interface MessagesChatArgs {
  amount?: Maybe<number>;
}
export interface CreateUserMutationArgs {
  user: CreateUserInput;
}
export interface VerifyEmailMutationArgs {
  token: string;
}
export interface ResetPasswordMutationArgs {
  token: string;

  newPassword: string;
}
export interface SendVerificationEmailMutationArgs {
  email: string;
}
export interface SendResetPasswordEmailMutationArgs {
  email: string;
}
export interface ChangePasswordMutationArgs {
  oldPassword: string;

  newPassword: string;
}
export interface TwoFactorSetMutationArgs {
  secret: TwoFactorSecretKeyInput;

  code: string;
}
export interface TwoFactorUnsetMutationArgs {
  code: string;
}
export interface ImpersonateMutationArgs {
  accessToken: string;

  username: string;
}
export interface RefreshTokensMutationArgs {
  accessToken: string;

  refreshToken: string;
}
export interface AuthenticateMutationArgs {
  serviceName: string;

  params: AuthenticateParamsInput;
}
export interface UpdateUserMutationArgs {
  name?: Maybe<string>;

  picture?: Maybe<string>;
}
export interface UploadPictureMutationArgs {
  file: Upload;
}
export interface AddChatMutationArgs {
  userId: string;
}
export interface AddGroupMutationArgs {
  userIds: string[];

  groupName: string;

  groupPicture?: Maybe<string>;
}
export interface UpdateGroupMutationArgs {
  chatId: string;

  groupName?: Maybe<string>;

  groupPicture?: Maybe<string>;
}
export interface RemoveChatMutationArgs {
  chatId: string;
}
export interface AddAdminsMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface RemoveAdminsMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface AddMembersMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface RemoveMembersMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface AddMessageMutationArgs {
  chatId: string;

  content: string;
}
export interface RemoveMessagesMutationArgs {
  chatId: string;

  messageIds?: Maybe<string[]>;

  all?: Maybe<boolean>;
}
export interface MarkAsReceivedMutationArgs {
  chatId: string;
}
export interface MarkAsReadMutationArgs {
  chatId: string;
}

import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig
} from "graphql";

import { ModuleContext } from "@graphql-modules/core";

export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<
  Result,
  Parent = {},
  Context = {},
  Args = {}
> =
  | ((
      ...args: any[]
    ) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent: Parent,
  context: Context,
  info: GraphQLResolveInfo
) => Maybe<Types>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export namespace QueryResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = {}> {
    twoFactorSecret?: TwoFactorSecretResolver<
      Maybe<TwoFactorSecretKey>,
      TypeParent,
      Context
    >;

    getUser?: GetUserResolver<Maybe<UserEntity>, TypeParent, Context>;

    users?: UsersResolver<Maybe<UserEntity[]>, TypeParent, Context>;

    chats?: ChatsResolver<ChatEntity[], TypeParent, Context>;

    chat?: ChatResolver<Maybe<ChatEntity>, TypeParent, Context>;
  }

  export type TwoFactorSecretResolver<
    R = Maybe<TwoFactorSecretKey>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type GetUserResolver<
    R = Maybe<UserEntity>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type UsersResolver<
    R = Maybe<UserEntity[]>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ChatsResolver<
    R = ChatEntity[],
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = Maybe<ChatEntity>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, ChatArgs>;
  export interface ChatArgs {
    chatId: string;
  }
}

export namespace TwoFactorSecretKeyResolvers {
  export interface Resolvers<
    Context = ModuleContext,
    TypeParent = TwoFactorSecretKey
  > {
    ascii?: AsciiResolver<Maybe<string>, TypeParent, Context>;

    base32?: Base32Resolver<Maybe<string>, TypeParent, Context>;

    hex?: HexResolver<Maybe<string>, TypeParent, Context>;

    qr_code_ascii?: QrCodeAsciiResolver<Maybe<string>, TypeParent, Context>;

    qr_code_hex?: QrCodeHexResolver<Maybe<string>, TypeParent, Context>;

    qr_code_base32?: QrCodeBase32Resolver<Maybe<string>, TypeParent, Context>;

    google_auth_qr?: GoogleAuthQrResolver<Maybe<string>, TypeParent, Context>;

    otpauth_url?: OtpauthUrlResolver<Maybe<string>, TypeParent, Context>;
  }

  export type AsciiResolver<
    R = Maybe<string>,
    Parent = TwoFactorSecretKey,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type Base32Resolver<
    R = Maybe<string>,
    Parent = TwoFactorSecretKey,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type HexResolver<
    R = Maybe<string>,
    Parent = TwoFactorSecretKey,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type QrCodeAsciiResolver<
    R = Maybe<string>,
    Parent = TwoFactorSecretKey,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type QrCodeHexResolver<
    R = Maybe<string>,
    Parent = TwoFactorSecretKey,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type QrCodeBase32Resolver<
    R = Maybe<string>,
    Parent = TwoFactorSecretKey,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type GoogleAuthQrResolver<
    R = Maybe<string>,
    Parent = TwoFactorSecretKey,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type OtpauthUrlResolver<
    R = Maybe<string>,
    Parent = TwoFactorSecretKey,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace UserResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = UserEntity> {
    id?: IdResolver<string, TypeParent, Context>;

    emails?: EmailsResolver<Maybe<EmailRecord[]>, TypeParent, Context>;

    username?: UsernameResolver<Maybe<string>, TypeParent, Context>;

    name?: NameResolver<Maybe<string>, TypeParent, Context>;

    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;

    phone?: PhoneResolver<Maybe<string>, TypeParent, Context>;
  }

  export type IdResolver<
    R = string,
    Parent = UserEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type EmailsResolver<
    R = Maybe<EmailRecord[]>,
    Parent = UserEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type UsernameResolver<
    R = Maybe<string>,
    Parent = UserEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = UserEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = UserEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type PhoneResolver<
    R = Maybe<string>,
    Parent = UserEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace EmailRecordResolvers {
  export interface Resolvers<
    Context = ModuleContext,
    TypeParent = EmailRecord
  > {
    address?: AddressResolver<Maybe<string>, TypeParent, Context>;

    verified?: VerifiedResolver<Maybe<boolean>, TypeParent, Context>;
  }

  export type AddressResolver<
    R = Maybe<string>,
    Parent = EmailRecord,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type VerifiedResolver<
    R = Maybe<boolean>,
    Parent = EmailRecord,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace ChatResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = ChatEntity> {
    id?: IdResolver<string, TypeParent, Context>;

    createdAt?: CreatedAtResolver<Date, TypeParent, Context>;

    name?: NameResolver<Maybe<string>, TypeParent, Context>;

    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;

    allTimeMembers?: AllTimeMembersResolver<UserEntity[], TypeParent, Context>;

    listingMembers?: ListingMembersResolver<UserEntity[], TypeParent, Context>;

    actualGroupMembers?: ActualGroupMembersResolver<
      Maybe<UserEntity[]>,
      TypeParent,
      Context
    >;

    admins?: AdminsResolver<Maybe<UserEntity[]>, TypeParent, Context>;

    owner?: OwnerResolver<Maybe<UserEntity>, TypeParent, Context>;

    isGroup?: IsGroupResolver<boolean, TypeParent, Context>;

    messages?: MessagesResolver<(Maybe<MessageEntity>)[], TypeParent, Context>;

    lastMessage?: LastMessageResolver<
      Maybe<MessageEntity>,
      TypeParent,
      Context
    >;

    updatedAt?: UpdatedAtResolver<Date, TypeParent, Context>;

    unreadMessages?: UnreadMessagesResolver<number, TypeParent, Context>;
  }

  export type IdResolver<
    R = string,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type CreatedAtResolver<
    R = Date,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type AllTimeMembersResolver<
    R = UserEntity[],
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ListingMembersResolver<
    R = UserEntity[],
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ActualGroupMembersResolver<
    R = Maybe<UserEntity[]>,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type AdminsResolver<
    R = Maybe<UserEntity[]>,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type OwnerResolver<
    R = Maybe<UserEntity>,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type IsGroupResolver<
    R = boolean,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type MessagesResolver<
    R = (Maybe<MessageEntity>)[],
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context, MessagesArgs>;
  export interface MessagesArgs {
    amount?: Maybe<number>;
  }

  export type LastMessageResolver<
    R = Maybe<MessageEntity>,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type UpdatedAtResolver<
    R = Date,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type UnreadMessagesResolver<
    R = number,
    Parent = ChatEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace MessageResolvers {
  export interface Resolvers<
    Context = ModuleContext,
    TypeParent = MessageEntity
  > {
    id?: IdResolver<string, TypeParent, Context>;

    sender?: SenderResolver<UserEntity, TypeParent, Context>;

    chat?: ChatResolver<ChatEntity, TypeParent, Context>;

    content?: ContentResolver<string, TypeParent, Context>;

    createdAt?: CreatedAtResolver<Date, TypeParent, Context>;

    type?: TypeResolver<number, TypeParent, Context>;

    holders?: HoldersResolver<UserEntity[], TypeParent, Context>;

    ownership?: OwnershipResolver<boolean, TypeParent, Context>;

    recipients?: RecipientsResolver<RecipientEntity[], TypeParent, Context>;
  }

  export type IdResolver<
    R = string,
    Parent = MessageEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type SenderResolver<
    R = UserEntity,
    Parent = MessageEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = ChatEntity,
    Parent = MessageEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ContentResolver<
    R = string,
    Parent = MessageEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type CreatedAtResolver<
    R = Date,
    Parent = MessageEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type TypeResolver<
    R = number,
    Parent = MessageEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type HoldersResolver<
    R = UserEntity[],
    Parent = MessageEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type OwnershipResolver<
    R = boolean,
    Parent = MessageEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type RecipientsResolver<
    R = RecipientEntity[],
    Parent = MessageEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace RecipientResolvers {
  export interface Resolvers<
    Context = ModuleContext,
    TypeParent = RecipientEntity
  > {
    user?: UserResolver<UserEntity, TypeParent, Context>;

    message?: MessageResolver<MessageEntity, TypeParent, Context>;

    chat?: ChatResolver<ChatEntity, TypeParent, Context>;

    receivedAt?: ReceivedAtResolver<Maybe<Date>, TypeParent, Context>;

    readAt?: ReadAtResolver<Maybe<Date>, TypeParent, Context>;
  }

  export type UserResolver<
    R = UserEntity,
    Parent = RecipientEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type MessageResolver<
    R = MessageEntity,
    Parent = RecipientEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = ChatEntity,
    Parent = RecipientEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ReceivedAtResolver<
    R = Maybe<Date>,
    Parent = RecipientEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ReadAtResolver<
    R = Maybe<Date>,
    Parent = RecipientEntity,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace MutationResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = {}> {
    createUser?: CreateUserResolver<Maybe<string>, TypeParent, Context>;

    verifyEmail?: VerifyEmailResolver<Maybe<boolean>, TypeParent, Context>;

    resetPassword?: ResetPasswordResolver<
      Maybe<LoginResult>,
      TypeParent,
      Context
    >;

    sendVerificationEmail?: SendVerificationEmailResolver<
      Maybe<boolean>,
      TypeParent,
      Context
    >;

    sendResetPasswordEmail?: SendResetPasswordEmailResolver<
      Maybe<boolean>,
      TypeParent,
      Context
    >;

    changePassword?: ChangePasswordResolver<
      Maybe<boolean>,
      TypeParent,
      Context
    >;

    twoFactorSet?: TwoFactorSetResolver<Maybe<boolean>, TypeParent, Context>;

    twoFactorUnset?: TwoFactorUnsetResolver<
      Maybe<boolean>,
      TypeParent,
      Context
    >;

    impersonate?: ImpersonateResolver<
      Maybe<ImpersonateReturn>,
      TypeParent,
      Context
    >;

    refreshTokens?: RefreshTokensResolver<
      Maybe<LoginResult>,
      TypeParent,
      Context
    >;

    logout?: LogoutResolver<Maybe<boolean>, TypeParent, Context>;

    authenticate?: AuthenticateResolver<
      Maybe<LoginResult>,
      TypeParent,
      Context
    >;

    updateUser?: UpdateUserResolver<UserEntity, TypeParent, Context>;

    uploadPicture?: UploadPictureResolver<UploadedFile, TypeParent, Context>;

    addChat?: AddChatResolver<Maybe<ChatEntity>, TypeParent, Context>;

    addGroup?: AddGroupResolver<Maybe<ChatEntity>, TypeParent, Context>;

    updateGroup?: UpdateGroupResolver<Maybe<ChatEntity>, TypeParent, Context>;

    removeChat?: RemoveChatResolver<Maybe<string>, TypeParent, Context>;

    addAdmins?: AddAdminsResolver<(Maybe<string>)[], TypeParent, Context>;

    removeAdmins?: RemoveAdminsResolver<(Maybe<string>)[], TypeParent, Context>;

    addMembers?: AddMembersResolver<(Maybe<string>)[], TypeParent, Context>;

    removeMembers?: RemoveMembersResolver<
      (Maybe<string>)[],
      TypeParent,
      Context
    >;

    addMessage?: AddMessageResolver<Maybe<MessageEntity>, TypeParent, Context>;

    removeMessages?: RemoveMessagesResolver<
      (Maybe<string>)[],
      TypeParent,
      Context
    >;

    markAsReceived?: MarkAsReceivedResolver<
      Maybe<boolean>,
      TypeParent,
      Context
    >;

    markAsRead?: MarkAsReadResolver<Maybe<boolean>, TypeParent, Context>;
  }

  export type CreateUserResolver<
    R = Maybe<string>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, CreateUserArgs>;
  export interface CreateUserArgs {
    user: CreateUserInput;
  }

  export type VerifyEmailResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, VerifyEmailArgs>;
  export interface VerifyEmailArgs {
    token: string;
  }

  export type ResetPasswordResolver<
    R = Maybe<LoginResult>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, ResetPasswordArgs>;
  export interface ResetPasswordArgs {
    token: string;

    newPassword: string;
  }

  export type SendVerificationEmailResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, SendVerificationEmailArgs>;
  export interface SendVerificationEmailArgs {
    email: string;
  }

  export type SendResetPasswordEmailResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, SendResetPasswordEmailArgs>;
  export interface SendResetPasswordEmailArgs {
    email: string;
  }

  export type ChangePasswordResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, ChangePasswordArgs>;
  export interface ChangePasswordArgs {
    oldPassword: string;

    newPassword: string;
  }

  export type TwoFactorSetResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, TwoFactorSetArgs>;
  export interface TwoFactorSetArgs {
    secret: TwoFactorSecretKeyInput;

    code: string;
  }

  export type TwoFactorUnsetResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, TwoFactorUnsetArgs>;
  export interface TwoFactorUnsetArgs {
    code: string;
  }

  export type ImpersonateResolver<
    R = Maybe<ImpersonateReturn>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, ImpersonateArgs>;
  export interface ImpersonateArgs {
    accessToken: string;

    username: string;
  }

  export type RefreshTokensResolver<
    R = Maybe<LoginResult>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, RefreshTokensArgs>;
  export interface RefreshTokensArgs {
    accessToken: string;

    refreshToken: string;
  }

  export type LogoutResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type AuthenticateResolver<
    R = Maybe<LoginResult>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, AuthenticateArgs>;
  export interface AuthenticateArgs {
    serviceName: string;

    params: AuthenticateParamsInput;
  }

  export type UpdateUserResolver<
    R = UserEntity,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, UpdateUserArgs>;
  export interface UpdateUserArgs {
    name?: Maybe<string>;

    picture?: Maybe<string>;
  }

  export type UploadPictureResolver<
    R = UploadedFile,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, UploadPictureArgs>;
  export interface UploadPictureArgs {
    file: Upload;
  }

  export type AddChatResolver<
    R = Maybe<ChatEntity>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, AddChatArgs>;
  export interface AddChatArgs {
    userId: string;
  }

  export type AddGroupResolver<
    R = Maybe<ChatEntity>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, AddGroupArgs>;
  export interface AddGroupArgs {
    userIds: string[];

    groupName: string;

    groupPicture?: Maybe<string>;
  }

  export type UpdateGroupResolver<
    R = Maybe<ChatEntity>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, UpdateGroupArgs>;
  export interface UpdateGroupArgs {
    chatId: string;

    groupName?: Maybe<string>;

    groupPicture?: Maybe<string>;
  }

  export type RemoveChatResolver<
    R = Maybe<string>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, RemoveChatArgs>;
  export interface RemoveChatArgs {
    chatId: string;
  }

  export type AddAdminsResolver<
    R = (Maybe<string>)[],
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, AddAdminsArgs>;
  export interface AddAdminsArgs {
    groupId: string;

    userIds: string[];
  }

  export type RemoveAdminsResolver<
    R = (Maybe<string>)[],
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, RemoveAdminsArgs>;
  export interface RemoveAdminsArgs {
    groupId: string;

    userIds: string[];
  }

  export type AddMembersResolver<
    R = (Maybe<string>)[],
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, AddMembersArgs>;
  export interface AddMembersArgs {
    groupId: string;

    userIds: string[];
  }

  export type RemoveMembersResolver<
    R = (Maybe<string>)[],
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, RemoveMembersArgs>;
  export interface RemoveMembersArgs {
    groupId: string;

    userIds: string[];
  }

  export type AddMessageResolver<
    R = Maybe<MessageEntity>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, AddMessageArgs>;
  export interface AddMessageArgs {
    chatId: string;

    content: string;
  }

  export type RemoveMessagesResolver<
    R = (Maybe<string>)[],
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, RemoveMessagesArgs>;
  export interface RemoveMessagesArgs {
    chatId: string;

    messageIds?: Maybe<string[]>;

    all?: Maybe<boolean>;
  }

  export type MarkAsReceivedResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, MarkAsReceivedArgs>;
  export interface MarkAsReceivedArgs {
    chatId: string;
  }

  export type MarkAsReadResolver<
    R = Maybe<boolean>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, MarkAsReadArgs>;
  export interface MarkAsReadArgs {
    chatId: string;
  }
}

export namespace LoginResultResolvers {
  export interface Resolvers<
    Context = ModuleContext,
    TypeParent = LoginResult
  > {
    sessionId?: SessionIdResolver<Maybe<string>, TypeParent, Context>;

    tokens?: TokensResolver<Maybe<Tokens>, TypeParent, Context>;
  }

  export type SessionIdResolver<
    R = Maybe<string>,
    Parent = LoginResult,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type TokensResolver<
    R = Maybe<Tokens>,
    Parent = LoginResult,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace TokensResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = Tokens> {
    refreshToken?: RefreshTokenResolver<Maybe<string>, TypeParent, Context>;

    accessToken?: AccessTokenResolver<Maybe<string>, TypeParent, Context>;
  }

  export type RefreshTokenResolver<
    R = Maybe<string>,
    Parent = Tokens,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type AccessTokenResolver<
    R = Maybe<string>,
    Parent = Tokens,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace ImpersonateReturnResolvers {
  export interface Resolvers<
    Context = ModuleContext,
    TypeParent = ImpersonateReturn
  > {
    authorized?: AuthorizedResolver<Maybe<boolean>, TypeParent, Context>;

    tokens?: TokensResolver<Maybe<Tokens>, TypeParent, Context>;

    user?: UserResolver<Maybe<UserEntity>, TypeParent, Context>;
  }

  export type AuthorizedResolver<
    R = Maybe<boolean>,
    Parent = ImpersonateReturn,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type TokensResolver<
    R = Maybe<Tokens>,
    Parent = ImpersonateReturn,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type UserResolver<
    R = Maybe<UserEntity>,
    Parent = ImpersonateReturn,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace UploadedFileResolvers {
  export interface Resolvers<
    Context = ModuleContext,
    TypeParent = UploadedFile
  > {
    url?: UrlResolver<string, TypeParent, Context>;
  }

  export type UrlResolver<
    R = string,
    Parent = UploadedFile,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace SubscriptionResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = {}> {
    userAdded?: UserAddedResolver<Maybe<UserEntity>, TypeParent, Context>;

    userUpdated?: UserUpdatedResolver<Maybe<UserEntity>, TypeParent, Context>;

    chatAdded?: ChatAddedResolver<Maybe<ChatEntity>, TypeParent, Context>;

    chatUpdated?: ChatUpdatedResolver<Maybe<ChatEntity>, TypeParent, Context>;

    messageAdded?: MessageAddedResolver<
      Maybe<MessageEntity>,
      TypeParent,
      Context
    >;
  }

  export type UserAddedResolver<
    R = Maybe<UserEntity>,
    Parent = {},
    Context = ModuleContext
  > = SubscriptionResolver<R, Parent, Context>;
  export type UserUpdatedResolver<
    R = Maybe<UserEntity>,
    Parent = {},
    Context = ModuleContext
  > = SubscriptionResolver<R, Parent, Context>;
  export type ChatAddedResolver<
    R = Maybe<ChatEntity>,
    Parent = {},
    Context = ModuleContext
  > = SubscriptionResolver<R, Parent, Context>;
  export type ChatUpdatedResolver<
    R = Maybe<ChatEntity>,
    Parent = {},
    Context = ModuleContext
  > = SubscriptionResolver<R, Parent, Context>;
  export type MessageAddedResolver<
    R = Maybe<MessageEntity>,
    Parent = {},
    Context = ModuleContext
  > = SubscriptionResolver<R, Parent, Context>;
}

export type AuthDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  {},
  ModuleContext
>; /** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  SkipDirectiveArgs,
  ModuleContext
>;
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean;
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  IncludeDirectiveArgs,
  ModuleContext
>;
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean;
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  DeprecatedDirectiveArgs,
  ModuleContext
>;
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string;
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
  name: "Date";
}
export interface UploadScalarConfig
  extends GraphQLScalarTypeConfig<Upload, any> {
  name: "Upload";
}

export interface IResolvers<Context = ModuleContext> {
  Query?: QueryResolvers.Resolvers<Context>;
  TwoFactorSecretKey?: TwoFactorSecretKeyResolvers.Resolvers<Context>;
  User?: UserResolvers.Resolvers<Context>;
  EmailRecord?: EmailRecordResolvers.Resolvers<Context>;
  Chat?: ChatResolvers.Resolvers<Context>;
  Message?: MessageResolvers.Resolvers<Context>;
  Recipient?: RecipientResolvers.Resolvers<Context>;
  Mutation?: MutationResolvers.Resolvers<Context>;
  LoginResult?: LoginResultResolvers.Resolvers<Context>;
  Tokens?: TokensResolvers.Resolvers<Context>;
  ImpersonateReturn?: ImpersonateReturnResolvers.Resolvers<Context>;
  UploadedFile?: UploadedFileResolvers.Resolvers<Context>;
  Subscription?: SubscriptionResolvers.Resolvers<Context>;
  Date?: GraphQLScalarType;
  Upload?: GraphQLScalarType;
}

export interface IDirectiveResolvers<Result> {
  auth?: AuthDirectiveResolver<Result>;
  skip?: SkipDirectiveResolver<Result>;
  include?: IncludeDirectiveResolver<Result>;
  deprecated?: DeprecatedDirectiveResolver<Result>;
}
