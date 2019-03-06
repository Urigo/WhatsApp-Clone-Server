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

export type Resolver<Result, Parent = {}, TContext = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, TContext, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<
  Result,
  Parent = {},
  TContext = {},
  Args = {}
> =
  | ((
      ...args: any[]
    ) => ISubscriptionResolverObject<Result, Parent, TContext, Args>)
  | ISubscriptionResolverObject<Result, Parent, TContext, Args>;

export type TypeResolveFn<Types, Parent = {}, TContext = {}> = (
  parent: Parent,
  context: TContext,
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
  export interface Resolvers<TContext = ModuleContext, TypeParent = {}> {
    me?: MeResolver<Maybe<User>, TypeParent, TContext>;

    users?: UsersResolver<Maybe<User[]>, TypeParent, TContext>;

    chats?: ChatsResolver<Chat[], TypeParent, TContext>;

    chat?: ChatResolver<Maybe<Chat>, TypeParent, TContext>;
  }

  export type MeResolver<
    R = Maybe<User>,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type UsersResolver<
    R = Maybe<User[]>,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type ChatsResolver<
    R = Chat[],
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type ChatResolver<
    R = Maybe<Chat>,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, ChatArgs>;
  export interface ChatArgs {
    chatId: string;
  }
}

export namespace UserResolvers {
  export interface Resolvers<TContext = ModuleContext, TypeParent = User> {
    id?: IdResolver<string, TypeParent, TContext>;

    name?: NameResolver<Maybe<string>, TypeParent, TContext>;

    picture?: PictureResolver<Maybe<string>, TypeParent, TContext>;

    phone?: PhoneResolver<Maybe<string>, TypeParent, TContext>;
  }

  export type IdResolver<
    R = string,
    Parent = User,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = User,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = User,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type PhoneResolver<
    R = Maybe<string>,
    Parent = User,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
}

export namespace ChatResolvers {
  export interface Resolvers<TContext = ModuleContext, TypeParent = Chat> {
    id?: IdResolver<string, TypeParent, TContext>;

    createdAt?: CreatedAtResolver<Date, TypeParent, TContext>;

    name?: NameResolver<Maybe<string>, TypeParent, TContext>;

    picture?: PictureResolver<Maybe<string>, TypeParent, TContext>;

    allTimeMembers?: AllTimeMembersResolver<User[], TypeParent, TContext>;

    listingMembers?: ListingMembersResolver<User[], TypeParent, TContext>;

    actualGroupMembers?: ActualGroupMembersResolver<
      Maybe<User[]>,
      TypeParent,
      TContext
    >;

    admins?: AdminsResolver<Maybe<User[]>, TypeParent, TContext>;

    owner?: OwnerResolver<Maybe<User>, TypeParent, TContext>;

    isGroup?: IsGroupResolver<boolean, TypeParent, TContext>;

    messages?: MessagesResolver<(Maybe<Message>)[], TypeParent, TContext>;

    lastMessage?: LastMessageResolver<Maybe<Message>, TypeParent, TContext>;

    updatedAt?: UpdatedAtResolver<Date, TypeParent, TContext>;

    unreadMessages?: UnreadMessagesResolver<number, TypeParent, TContext>;
  }

  export type IdResolver<
    R = string,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type CreatedAtResolver<
    R = Date,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type AllTimeMembersResolver<
    R = User[],
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type ListingMembersResolver<
    R = User[],
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type ActualGroupMembersResolver<
    R = Maybe<User[]>,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type AdminsResolver<
    R = Maybe<User[]>,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type OwnerResolver<
    R = Maybe<User>,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type IsGroupResolver<
    R = boolean,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type MessagesResolver<
    R = (Maybe<Message>)[],
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, MessagesArgs>;
  export interface MessagesArgs {
    amount?: Maybe<number>;
  }

  export type LastMessageResolver<
    R = Maybe<Message>,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type UpdatedAtResolver<
    R = Date,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type UnreadMessagesResolver<
    R = number,
    Parent = Chat,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
}

export namespace MessageResolvers {
  export interface Resolvers<TContext = ModuleContext, TypeParent = Message> {
    id?: IdResolver<string, TypeParent, TContext>;

    sender?: SenderResolver<User, TypeParent, TContext>;

    chat?: ChatResolver<Chat, TypeParent, TContext>;

    content?: ContentResolver<string, TypeParent, TContext>;

    createdAt?: CreatedAtResolver<Date, TypeParent, TContext>;

    type?: TypeResolver<number, TypeParent, TContext>;

    holders?: HoldersResolver<User[], TypeParent, TContext>;

    ownership?: OwnershipResolver<boolean, TypeParent, TContext>;

    recipients?: RecipientsResolver<Recipient[], TypeParent, TContext>;
  }

  export type IdResolver<
    R = string,
    Parent = Message,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type SenderResolver<
    R = User,
    Parent = Message,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type ChatResolver<
    R = Chat,
    Parent = Message,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type ContentResolver<
    R = string,
    Parent = Message,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type CreatedAtResolver<
    R = Date,
    Parent = Message,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type TypeResolver<
    R = number,
    Parent = Message,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type HoldersResolver<
    R = User[],
    Parent = Message,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type OwnershipResolver<
    R = boolean,
    Parent = Message,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type RecipientsResolver<
    R = Recipient[],
    Parent = Message,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
}

export namespace RecipientResolvers {
  export interface Resolvers<TContext = ModuleContext, TypeParent = Recipient> {
    user?: UserResolver<User, TypeParent, TContext>;

    message?: MessageResolver<Message, TypeParent, TContext>;

    chat?: ChatResolver<Chat, TypeParent, TContext>;

    receivedAt?: ReceivedAtResolver<Maybe<Date>, TypeParent, TContext>;

    readAt?: ReadAtResolver<Maybe<Date>, TypeParent, TContext>;
  }

  export type UserResolver<
    R = User,
    Parent = Recipient,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type MessageResolver<
    R = Message,
    Parent = Recipient,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type ChatResolver<
    R = Chat,
    Parent = Recipient,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type ReceivedAtResolver<
    R = Maybe<Date>,
    Parent = Recipient,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
  export type ReadAtResolver<
    R = Maybe<Date>,
    Parent = Recipient,
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext>;
}

export namespace MutationResolvers {
  export interface Resolvers<TContext = ModuleContext, TypeParent = {}> {
    updateUser?: UpdateUserResolver<User, TypeParent, TContext>;

    addChat?: AddChatResolver<Maybe<Chat>, TypeParent, TContext>;

    addGroup?: AddGroupResolver<Maybe<Chat>, TypeParent, TContext>;

    updateGroup?: UpdateGroupResolver<Maybe<Chat>, TypeParent, TContext>;

    removeChat?: RemoveChatResolver<Maybe<string>, TypeParent, TContext>;

    addAdmins?: AddAdminsResolver<(Maybe<string>)[], TypeParent, TContext>;

    removeAdmins?: RemoveAdminsResolver<
      (Maybe<string>)[],
      TypeParent,
      TContext
    >;

    addMembers?: AddMembersResolver<(Maybe<string>)[], TypeParent, TContext>;

    removeMembers?: RemoveMembersResolver<
      (Maybe<string>)[],
      TypeParent,
      TContext
    >;

    addMessage?: AddMessageResolver<Maybe<Message>, TypeParent, TContext>;

    removeMessages?: RemoveMessagesResolver<
      (Maybe<string>)[],
      TypeParent,
      TContext
    >;

    markAsReceived?: MarkAsReceivedResolver<
      Maybe<boolean>,
      TypeParent,
      TContext
    >;

    markAsRead?: MarkAsReadResolver<Maybe<boolean>, TypeParent, TContext>;
  }

  export type UpdateUserResolver<
    R = User,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, UpdateUserArgs>;
  export interface UpdateUserArgs {
    name?: Maybe<string>;

    picture?: Maybe<string>;
  }

  export type AddChatResolver<
    R = Maybe<Chat>,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, AddChatArgs>;
  export interface AddChatArgs {
    userId: string;
  }

  export type AddGroupResolver<
    R = Maybe<Chat>,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, AddGroupArgs>;
  export interface AddGroupArgs {
    userIds: string[];

    groupName: string;

    groupPicture?: Maybe<string>;
  }

  export type UpdateGroupResolver<
    R = Maybe<Chat>,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, UpdateGroupArgs>;
  export interface UpdateGroupArgs {
    chatId: string;

    groupName?: Maybe<string>;

    groupPicture?: Maybe<string>;
  }

  export type RemoveChatResolver<
    R = Maybe<string>,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, RemoveChatArgs>;
  export interface RemoveChatArgs {
    chatId: string;
  }

  export type AddAdminsResolver<
    R = (Maybe<string>)[],
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, AddAdminsArgs>;
  export interface AddAdminsArgs {
    groupId: string;

    userIds: string[];
  }

  export type RemoveAdminsResolver<
    R = (Maybe<string>)[],
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, RemoveAdminsArgs>;
  export interface RemoveAdminsArgs {
    groupId: string;

    userIds: string[];
  }

  export type AddMembersResolver<
    R = (Maybe<string>)[],
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, AddMembersArgs>;
  export interface AddMembersArgs {
    groupId: string;

    userIds: string[];
  }

  export type RemoveMembersResolver<
    R = (Maybe<string>)[],
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, RemoveMembersArgs>;
  export interface RemoveMembersArgs {
    groupId: string;

    userIds: string[];
  }

  export type AddMessageResolver<
    R = Maybe<Message>,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, AddMessageArgs>;
  export interface AddMessageArgs {
    chatId: string;

    content: string;
  }

  export type RemoveMessagesResolver<
    R = (Maybe<string>)[],
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, RemoveMessagesArgs>;
  export interface RemoveMessagesArgs {
    chatId: string;

    messageIds?: Maybe<string[]>;

    all?: Maybe<boolean>;
  }

  export type MarkAsReceivedResolver<
    R = Maybe<boolean>,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, MarkAsReceivedArgs>;
  export interface MarkAsReceivedArgs {
    chatId: string;
  }

  export type MarkAsReadResolver<
    R = Maybe<boolean>,
    Parent = {},
    TContext = ModuleContext
  > = Resolver<R, Parent, TContext, MarkAsReadArgs>;
  export interface MarkAsReadArgs {
    chatId: string;
  }
}

export namespace SubscriptionResolvers {
  export interface Resolvers<TContext = ModuleContext, TypeParent = {}> {
    userAdded?: UserAddedResolver<Maybe<User>, TypeParent, TContext>;

    userUpdated?: UserUpdatedResolver<Maybe<User>, TypeParent, TContext>;

    chatAdded?: ChatAddedResolver<Maybe<Chat>, TypeParent, TContext>;

    chatUpdated?: ChatUpdatedResolver<Maybe<Chat>, TypeParent, TContext>;

    messageAdded?: MessageAddedResolver<Maybe<Message>, TypeParent, TContext>;
  }

  export type UserAddedResolver<
    R = Maybe<User>,
    Parent = {},
    TContext = ModuleContext
  > = SubscriptionResolver<R, Parent, TContext>;
  export type UserUpdatedResolver<
    R = Maybe<User>,
    Parent = {},
    TContext = ModuleContext
  > = SubscriptionResolver<R, Parent, TContext>;
  export type ChatAddedResolver<
    R = Maybe<Chat>,
    Parent = {},
    TContext = ModuleContext
  > = SubscriptionResolver<R, Parent, TContext>;
  export type ChatUpdatedResolver<
    R = Maybe<Chat>,
    Parent = {},
    TContext = ModuleContext
  > = SubscriptionResolver<R, Parent, TContext>;
  export type MessageAddedResolver<
    R = Maybe<Message>,
    Parent = {},
    TContext = ModuleContext
  > = SubscriptionResolver<R, Parent, TContext>;
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

export interface IResolvers<TContext = ModuleContext> {
  Query?: QueryResolvers.Resolvers<TContext>;
  User?: UserResolvers.Resolvers<TContext>;
  Chat?: ChatResolvers.Resolvers<TContext>;
  Message?: MessageResolvers.Resolvers<TContext>;
  Recipient?: RecipientResolvers.Resolvers<TContext>;
  Mutation?: MutationResolvers.Resolvers<TContext>;
  Subscription?: SubscriptionResolvers.Resolvers<TContext>;
  Date?: GraphQLScalarType;
}

export interface IDirectiveResolvers<Result> {
  skip?: SkipDirectiveResolver<Result>;
  include?: IncludeDirectiveResolver<Result>;
  deprecated?: DeprecatedDirectiveResolver<Result>;
}
