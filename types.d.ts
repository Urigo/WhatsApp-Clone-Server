export type Maybe<T> = T | undefined | null;

export enum MessageType {
  Location = "LOCATION",
  Text = "TEXT",
  Picture = "PICTURE"
}

import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig
} from "graphql";

import { Chat } from "./entity/Chat";

import { Message } from "./entity/Message";

import { Recipient } from "./entity/Recipient";

import { User } from "./entity/User";

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
    me?: MeResolver<Maybe<User>, TypeParent, Context>;

    users?: UsersResolver<Maybe<User[]>, TypeParent, Context>;

    chats?: ChatsResolver<Chat[], TypeParent, Context>;

    chat?: ChatResolver<Maybe<Chat>, TypeParent, Context>;
  }

  export type MeResolver<
    R = Maybe<User>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type UsersResolver<
    R = Maybe<User[]>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ChatsResolver<
    R = Chat[],
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = Maybe<Chat>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, ChatArgs>;
  export interface ChatArgs {
    chatId: string;
  }
}

export namespace UserResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = User> {
    id?: IdResolver<string, TypeParent, Context>;

    name?: NameResolver<Maybe<string>, TypeParent, Context>;

    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;

    phone?: PhoneResolver<Maybe<string>, TypeParent, Context>;
  }

  export type IdResolver<
    R = string,
    Parent = User,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = User,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = User,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type PhoneResolver<
    R = Maybe<string>,
    Parent = User,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace ChatResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = Chat> {
    id?: IdResolver<string, TypeParent, Context>;

    createdAt?: CreatedAtResolver<Date, TypeParent, Context>;

    name?: NameResolver<Maybe<string>, TypeParent, Context>;

    picture?: PictureResolver<Maybe<string>, TypeParent, Context>;

    allTimeMembers?: AllTimeMembersResolver<User[], TypeParent, Context>;

    listingMembers?: ListingMembersResolver<User[], TypeParent, Context>;

    actualGroupMembers?: ActualGroupMembersResolver<
      Maybe<User[]>,
      TypeParent,
      Context
    >;

    admins?: AdminsResolver<Maybe<User[]>, TypeParent, Context>;

    owner?: OwnerResolver<Maybe<User>, TypeParent, Context>;

    isGroup?: IsGroupResolver<boolean, TypeParent, Context>;

    messages?: MessagesResolver<(Maybe<Message>)[], TypeParent, Context>;

    lastMessage?: LastMessageResolver<Maybe<Message>, TypeParent, Context>;

    updatedAt?: UpdatedAtResolver<Date, TypeParent, Context>;

    unreadMessages?: UnreadMessagesResolver<number, TypeParent, Context>;
  }

  export type IdResolver<
    R = string,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type CreatedAtResolver<
    R = Date,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type AllTimeMembersResolver<
    R = User[],
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ListingMembersResolver<
    R = User[],
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ActualGroupMembersResolver<
    R = Maybe<User[]>,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type AdminsResolver<
    R = Maybe<User[]>,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type OwnerResolver<
    R = Maybe<User>,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type IsGroupResolver<
    R = boolean,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type MessagesResolver<
    R = (Maybe<Message>)[],
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context, MessagesArgs>;
  export interface MessagesArgs {
    amount?: Maybe<number>;
  }

  export type LastMessageResolver<
    R = Maybe<Message>,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type UpdatedAtResolver<
    R = Date,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type UnreadMessagesResolver<
    R = number,
    Parent = Chat,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace MessageResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = Message> {
    id?: IdResolver<string, TypeParent, Context>;

    sender?: SenderResolver<User, TypeParent, Context>;

    chat?: ChatResolver<Chat, TypeParent, Context>;

    content?: ContentResolver<string, TypeParent, Context>;

    createdAt?: CreatedAtResolver<Date, TypeParent, Context>;

    type?: TypeResolver<number, TypeParent, Context>;

    holders?: HoldersResolver<User[], TypeParent, Context>;

    ownership?: OwnershipResolver<boolean, TypeParent, Context>;

    recipients?: RecipientsResolver<Recipient[], TypeParent, Context>;
  }

  export type IdResolver<
    R = string,
    Parent = Message,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type SenderResolver<
    R = User,
    Parent = Message,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = Chat,
    Parent = Message,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ContentResolver<
    R = string,
    Parent = Message,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type CreatedAtResolver<
    R = Date,
    Parent = Message,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type TypeResolver<
    R = number,
    Parent = Message,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type HoldersResolver<
    R = User[],
    Parent = Message,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type OwnershipResolver<
    R = boolean,
    Parent = Message,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type RecipientsResolver<
    R = Recipient[],
    Parent = Message,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace RecipientResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = Recipient> {
    user?: UserResolver<User, TypeParent, Context>;

    message?: MessageResolver<Message, TypeParent, Context>;

    chat?: ChatResolver<Chat, TypeParent, Context>;

    receivedAt?: ReceivedAtResolver<Maybe<Date>, TypeParent, Context>;

    readAt?: ReadAtResolver<Maybe<Date>, TypeParent, Context>;
  }

  export type UserResolver<
    R = User,
    Parent = Recipient,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type MessageResolver<
    R = Message,
    Parent = Recipient,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = Chat,
    Parent = Recipient,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ReceivedAtResolver<
    R = Maybe<Date>,
    Parent = Recipient,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
  export type ReadAtResolver<
    R = Maybe<Date>,
    Parent = Recipient,
    Context = ModuleContext
  > = Resolver<R, Parent, Context>;
}

export namespace MutationResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = {}> {
    updateUser?: UpdateUserResolver<User, TypeParent, Context>;

    addChat?: AddChatResolver<Maybe<Chat>, TypeParent, Context>;

    addGroup?: AddGroupResolver<Maybe<Chat>, TypeParent, Context>;

    updateChat?: UpdateChatResolver<Maybe<Chat>, TypeParent, Context>;

    removeChat?: RemoveChatResolver<Maybe<string>, TypeParent, Context>;

    addAdmins?: AddAdminsResolver<(Maybe<string>)[], TypeParent, Context>;

    removeAdmins?: RemoveAdminsResolver<(Maybe<string>)[], TypeParent, Context>;

    addMembers?: AddMembersResolver<(Maybe<string>)[], TypeParent, Context>;

    removeMembers?: RemoveMembersResolver<
      (Maybe<string>)[],
      TypeParent,
      Context
    >;

    addMessage?: AddMessageResolver<Maybe<Message>, TypeParent, Context>;

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

  export type UpdateUserResolver<
    R = User,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, UpdateUserArgs>;
  export interface UpdateUserArgs {
    name?: Maybe<string>;

    picture?: Maybe<string>;
  }

  export type AddChatResolver<
    R = Maybe<Chat>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, AddChatArgs>;
  export interface AddChatArgs {
    userId: string;
  }

  export type AddGroupResolver<
    R = Maybe<Chat>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, AddGroupArgs>;
  export interface AddGroupArgs {
    userIds: string[];

    groupName: string;

    groupPicture?: Maybe<string>;
  }

  export type UpdateChatResolver<
    R = Maybe<Chat>,
    Parent = {},
    Context = ModuleContext
  > = Resolver<R, Parent, Context, UpdateChatArgs>;
  export interface UpdateChatArgs {
    chatId: string;

    name?: Maybe<string>;

    picture?: Maybe<string>;
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
    R = Maybe<Message>,
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

export namespace SubscriptionResolvers {
  export interface Resolvers<Context = ModuleContext, TypeParent = {}> {
    userAdded?: UserAddedResolver<Maybe<User>, TypeParent, Context>;

    userUpdated?: UserUpdatedResolver<Maybe<User>, TypeParent, Context>;

    chatAdded?: ChatAddedResolver<Maybe<Chat>, TypeParent, Context>;

    chatUpdated?: ChatUpdatedResolver<Maybe<Chat>, TypeParent, Context>;

    messageAdded?: MessageAddedResolver<Maybe<Message>, TypeParent, Context>;
  }

  export type UserAddedResolver<
    R = Maybe<User>,
    Parent = {},
    Context = ModuleContext
  > = SubscriptionResolver<R, Parent, Context>;
  export type UserUpdatedResolver<
    R = Maybe<User>,
    Parent = {},
    Context = ModuleContext
  > = SubscriptionResolver<R, Parent, Context>;
  export type ChatAddedResolver<
    R = Maybe<Chat>,
    Parent = {},
    Context = ModuleContext
  > = SubscriptionResolver<R, Parent, Context>;
  export type ChatUpdatedResolver<
    R = Maybe<Chat>,
    Parent = {},
    Context = ModuleContext
  > = SubscriptionResolver<R, Parent, Context>;
  export type MessageAddedResolver<
    R = Maybe<Message>,
    Parent = {},
    Context = ModuleContext
  > = SubscriptionResolver<R, Parent, Context>;
}

/** Directs the executor to skip this field or fragment when the `if` argument is true. */
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

export interface IResolvers<Context = ModuleContext> {
  Query?: QueryResolvers.Resolvers<Context>;
  User?: UserResolvers.Resolvers<Context>;
  Chat?: ChatResolvers.Resolvers<Context>;
  Message?: MessageResolvers.Resolvers<Context>;
  Recipient?: RecipientResolvers.Resolvers<Context>;
  Mutation?: MutationResolvers.Resolvers<Context>;
  Subscription?: SubscriptionResolvers.Resolvers<Context>;
  Date?: GraphQLScalarType;
}

export interface IDirectiveResolvers<Result> {
  skip?: SkipDirectiveResolver<Result>;
  include?: IncludeDirectiveResolver<Result>;
  deprecated?: DeprecatedDirectiveResolver<Result>;
}
