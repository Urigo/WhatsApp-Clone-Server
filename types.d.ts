export type Maybe<T> = T | undefined | null;

export enum MessageType {
  Location = "LOCATION",
  Text = "TEXT",
  Picture = "PICTURE"
}

export type Date = any;

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  me?: Maybe<User>;

  users?: Maybe<User[]>;

  chats: Chat[];

  chat?: Maybe<Chat>;
}

export interface User {
  id: string;

  name?: Maybe<string>;

  picture?: Maybe<string>;

  phone?: Maybe<string>;
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

// ====================================================
// Arguments
// ====================================================

export interface ChatQueryArgs {
  chatId: string;
}
export interface MessagesChatArgs {
  amount?: Maybe<number>;
}

import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig
} from "graphql";

import { ChatDb, MessageDb, RecipientDb, UserDb } from "./db";

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
  export interface Resolvers<Context = {}, TypeParent = {}> {
    me?: MeResolver<Maybe<UserDb>, TypeParent, Context>;

    users?: UsersResolver<Maybe<UserDb[]>, TypeParent, Context>;

    chats?: ChatsResolver<ChatDb[], TypeParent, Context>;

    chat?: ChatResolver<Maybe<ChatDb>, TypeParent, Context>;
  }

  export type MeResolver<
    R = Maybe<UserDb>,
    Parent = {},
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type UsersResolver<
    R = Maybe<UserDb[]>,
    Parent = {},
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type ChatsResolver<R = ChatDb[], Parent = {}, Context = {}> = Resolver<
    R,
    Parent,
    Context
  >;
  export type ChatResolver<
    R = Maybe<ChatDb>,
    Parent = {},
    Context = {}
  > = Resolver<R, Parent, Context, ChatArgs>;
  export interface ChatArgs {
    chatId: string;
  }
}

export namespace UserResolvers {
  export interface Resolvers<Context = {}, TypeParent = UserDb> {
    id?: IdResolver<string, TypeParent, Context>;

    name?: NameResolver<Maybe<string>, TypeParent, Context>;

    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;

    phone?: PhoneResolver<Maybe<string>, TypeParent, Context>;
  }

  export type IdResolver<R = string, Parent = UserDb, Context = {}> = Resolver<
    R,
    Parent,
    Context
  >;
  export type NameResolver<
    R = Maybe<string>,
    Parent = UserDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = UserDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type PhoneResolver<
    R = Maybe<string>,
    Parent = UserDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
}

export namespace ChatResolvers {
  export interface Resolvers<Context = {}, TypeParent = ChatDb> {
    id?: IdResolver<string, TypeParent, Context>;

    createdAt?: CreatedAtResolver<Date, TypeParent, Context>;

    name?: NameResolver<Maybe<string>, TypeParent, Context>;

    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;

    allTimeMembers?: AllTimeMembersResolver<UserDb[], TypeParent, Context>;

    listingMembers?: ListingMembersResolver<UserDb[], TypeParent, Context>;

    actualGroupMembers?: ActualGroupMembersResolver<
      Maybe<UserDb[]>,
      TypeParent,
      Context
    >;

    admins?: AdminsResolver<Maybe<UserDb[]>, TypeParent, Context>;

    owner?: OwnerResolver<Maybe<UserDb>, TypeParent, Context>;

    isGroup?: IsGroupResolver<boolean, TypeParent, Context>;

    messages?: MessagesResolver<(Maybe<MessageDb>)[], TypeParent, Context>;

    lastMessage?: LastMessageResolver<Maybe<MessageDb>, TypeParent, Context>;

    updatedAt?: UpdatedAtResolver<Date, TypeParent, Context>;

    unreadMessages?: UnreadMessagesResolver<number, TypeParent, Context>;
  }

  export type IdResolver<R = string, Parent = ChatDb, Context = {}> = Resolver<
    R,
    Parent,
    Context
  >;
  export type CreatedAtResolver<
    R = Date,
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type AllTimeMembersResolver<
    R = UserDb[],
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type ListingMembersResolver<
    R = UserDb[],
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type ActualGroupMembersResolver<
    R = Maybe<UserDb[]>,
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type AdminsResolver<
    R = Maybe<UserDb[]>,
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type OwnerResolver<
    R = Maybe<UserDb>,
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type IsGroupResolver<
    R = boolean,
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type MessagesResolver<
    R = (Maybe<MessageDb>)[],
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context, MessagesArgs>;
  export interface MessagesArgs {
    amount?: Maybe<number>;
  }

  export type LastMessageResolver<
    R = Maybe<MessageDb>,
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type UpdatedAtResolver<
    R = Date,
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type UnreadMessagesResolver<
    R = number,
    Parent = ChatDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
}

export namespace MessageResolvers {
  export interface Resolvers<Context = {}, TypeParent = MessageDb> {
    id?: IdResolver<string, TypeParent, Context>;

    sender?: SenderResolver<UserDb, TypeParent, Context>;

    chat?: ChatResolver<ChatDb, TypeParent, Context>;

    content?: ContentResolver<string, TypeParent, Context>;

    createdAt?: CreatedAtResolver<Date, TypeParent, Context>;

    type?: TypeResolver<number, TypeParent, Context>;

    holders?: HoldersResolver<UserDb[], TypeParent, Context>;

    ownership?: OwnershipResolver<boolean, TypeParent, Context>;

    recipients?: RecipientsResolver<RecipientDb[], TypeParent, Context>;
  }

  export type IdResolver<
    R = string,
    Parent = MessageDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type SenderResolver<
    R = UserDb,
    Parent = MessageDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = ChatDb,
    Parent = MessageDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type ContentResolver<
    R = string,
    Parent = MessageDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type CreatedAtResolver<
    R = Date,
    Parent = MessageDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type TypeResolver<
    R = number,
    Parent = MessageDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type HoldersResolver<
    R = UserDb[],
    Parent = MessageDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type OwnershipResolver<
    R = boolean,
    Parent = MessageDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type RecipientsResolver<
    R = RecipientDb[],
    Parent = MessageDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
}

export namespace RecipientResolvers {
  export interface Resolvers<Context = {}, TypeParent = RecipientDb> {
    user?: UserResolver<UserDb, TypeParent, Context>;

    message?: MessageResolver<MessageDb, TypeParent, Context>;

    chat?: ChatResolver<ChatDb, TypeParent, Context>;

    receivedAt?: ReceivedAtResolver<Maybe<Date>, TypeParent, Context>;

    readAt?: ReadAtResolver<Maybe<Date>, TypeParent, Context>;
  }

  export type UserResolver<
    R = UserDb,
    Parent = RecipientDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type MessageResolver<
    R = MessageDb,
    Parent = RecipientDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = ChatDb,
    Parent = RecipientDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type ReceivedAtResolver<
    R = Maybe<Date>,
    Parent = RecipientDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
  export type ReadAtResolver<
    R = Maybe<Date>,
    Parent = RecipientDb,
    Context = {}
  > = Resolver<R, Parent, Context>;
}

/** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  SkipDirectiveArgs,
  {}
>;
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean;
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  IncludeDirectiveArgs,
  {}
>;
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean;
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  DeprecatedDirectiveArgs,
  {}
>;
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string;
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
  name: "Date";
}

export interface IResolvers<Context = {}> {
  Query?: QueryResolvers.Resolvers<Context>;
  User?: UserResolvers.Resolvers<Context>;
  Chat?: ChatResolvers.Resolvers<Context>;
  Message?: MessageResolvers.Resolvers<Context>;
  Recipient?: RecipientResolvers.Resolvers<Context>;
  Date?: GraphQLScalarType;
}

export interface IDirectiveResolvers<Result> {
  skip?: SkipDirectiveResolver<Result>;
  include?: IncludeDirectiveResolver<Result>;
  deprecated?: DeprecatedDirectiveResolver<Result>;
}
