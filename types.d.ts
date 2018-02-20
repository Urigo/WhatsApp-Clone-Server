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

export interface Mutation {
  updateUser: User;

  addChat?: Maybe<Chat>;

  addGroup?: Maybe<Chat>;

  updateGroup?: Maybe<Chat>;

  removeChat?: Maybe<string>;

  addMessage?: Maybe<Message>;

  removeMessages?: Maybe<(Maybe<string>)[]>;

  addMembers?: Maybe<(Maybe<string>)[]>;

  removeMembers?: Maybe<(Maybe<string>)[]>;

  addAdmins?: Maybe<(Maybe<string>)[]>;

  removeAdmins?: Maybe<(Maybe<string>)[]>;

  setGroupName?: Maybe<string>;

  setGroupPicture?: Maybe<string>;

  markAsReceived?: Maybe<boolean>;

  markAsRead?: Maybe<boolean>;
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
export interface UpdateUserMutationArgs {
  name?: Maybe<string>;

  picture?: Maybe<string>;
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
export interface AddMessageMutationArgs {
  chatId: string;

  content: string;
}
export interface RemoveMessagesMutationArgs {
  chatId: string;

  messageIds?: Maybe<(Maybe<string>)[]>;

  all?: Maybe<boolean>;
}
export interface AddMembersMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface RemoveMembersMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface AddAdminsMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface RemoveAdminsMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface SetGroupNameMutationArgs {
  groupId: string;
}
export interface SetGroupPictureMutationArgs {
  groupId: string;
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

import { ChatDb, MessageDb, RecipientDb, UserDb } from "./db";

import { AppContext } from "./schema/types";

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
  export interface Resolvers<TContext = AppContext, TypeParent = {}> {
    me?: MeResolver<Maybe<UserDb>, TypeParent, TContext>;

    users?: UsersResolver<Maybe<UserDb[]>, TypeParent, TContext>;

    chats?: ChatsResolver<ChatDb[], TypeParent, TContext>;

    chat?: ChatResolver<Maybe<ChatDb>, TypeParent, TContext>;
  }

  export type MeResolver<
    R = Maybe<UserDb>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type UsersResolver<
    R = Maybe<UserDb[]>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type ChatsResolver<
    R = ChatDb[],
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type ChatResolver<
    R = Maybe<ChatDb>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, ChatArgs>;
  export interface ChatArgs {
    chatId: string;
  }
}

export namespace UserResolvers {
  export interface Resolvers<TContext = AppContext, TypeParent = UserDb> {
    id?: IdResolver<string, TypeParent, TContext>;

    name?: NameResolver<Maybe<string>, TypeParent, TContext>;

    picture?: PictureResolver<Maybe<string>, TypeParent, TContext>;

    phone?: PhoneResolver<Maybe<string>, TypeParent, TContext>;
  }

  export type IdResolver<
    R = string,
    Parent = UserDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = UserDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = UserDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type PhoneResolver<
    R = Maybe<string>,
    Parent = UserDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
}

export namespace ChatResolvers {
  export interface Resolvers<TContext = AppContext, TypeParent = ChatDb> {
    id?: IdResolver<string, TypeParent, TContext>;

    createdAt?: CreatedAtResolver<Date, TypeParent, TContext>;

    name?: NameResolver<Maybe<string>, TypeParent, TContext>;

    picture?: PictureResolver<Maybe<string>, TypeParent, TContext>;

    allTimeMembers?: AllTimeMembersResolver<UserDb[], TypeParent, TContext>;

    listingMembers?: ListingMembersResolver<UserDb[], TypeParent, TContext>;

    actualGroupMembers?: ActualGroupMembersResolver<
      Maybe<UserDb[]>,
      TypeParent,
      TContext
    >;

    admins?: AdminsResolver<Maybe<UserDb[]>, TypeParent, TContext>;

    owner?: OwnerResolver<Maybe<UserDb>, TypeParent, TContext>;

    isGroup?: IsGroupResolver<boolean, TypeParent, TContext>;

    messages?: MessagesResolver<(Maybe<MessageDb>)[], TypeParent, TContext>;

    lastMessage?: LastMessageResolver<Maybe<MessageDb>, TypeParent, TContext>;

    updatedAt?: UpdatedAtResolver<Date, TypeParent, TContext>;

    unreadMessages?: UnreadMessagesResolver<number, TypeParent, TContext>;
  }

  export type IdResolver<
    R = string,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type CreatedAtResolver<
    R = Date,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type NameResolver<
    R = Maybe<string>,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type PictureResolver<
    R = Maybe<string>,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type AllTimeMembersResolver<
    R = UserDb[],
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type ListingMembersResolver<
    R = UserDb[],
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type ActualGroupMembersResolver<
    R = Maybe<UserDb[]>,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type AdminsResolver<
    R = Maybe<UserDb[]>,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type OwnerResolver<
    R = Maybe<UserDb>,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type IsGroupResolver<
    R = boolean,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type MessagesResolver<
    R = (Maybe<MessageDb>)[],
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext, MessagesArgs>;
  export interface MessagesArgs {
    amount?: Maybe<number>;
  }

  export type LastMessageResolver<
    R = Maybe<MessageDb>,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type UpdatedAtResolver<
    R = Date,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type UnreadMessagesResolver<
    R = number,
    Parent = ChatDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
}

export namespace MessageResolvers {
  export interface Resolvers<TContext = AppContext, TypeParent = MessageDb> {
    id?: IdResolver<string, TypeParent, TContext>;

    sender?: SenderResolver<UserDb, TypeParent, TContext>;

    chat?: ChatResolver<ChatDb, TypeParent, TContext>;

    content?: ContentResolver<string, TypeParent, TContext>;

    createdAt?: CreatedAtResolver<Date, TypeParent, TContext>;

    type?: TypeResolver<number, TypeParent, TContext>;

    holders?: HoldersResolver<UserDb[], TypeParent, TContext>;

    ownership?: OwnershipResolver<boolean, TypeParent, TContext>;

    recipients?: RecipientsResolver<RecipientDb[], TypeParent, TContext>;
  }

  export type IdResolver<
    R = string,
    Parent = MessageDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type SenderResolver<
    R = UserDb,
    Parent = MessageDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type ChatResolver<
    R = ChatDb,
    Parent = MessageDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type ContentResolver<
    R = string,
    Parent = MessageDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type CreatedAtResolver<
    R = Date,
    Parent = MessageDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type TypeResolver<
    R = number,
    Parent = MessageDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type HoldersResolver<
    R = UserDb[],
    Parent = MessageDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type OwnershipResolver<
    R = boolean,
    Parent = MessageDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type RecipientsResolver<
    R = RecipientDb[],
    Parent = MessageDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
}

export namespace RecipientResolvers {
  export interface Resolvers<TContext = AppContext, TypeParent = RecipientDb> {
    user?: UserResolver<UserDb, TypeParent, TContext>;

    message?: MessageResolver<MessageDb, TypeParent, TContext>;

    chat?: ChatResolver<ChatDb, TypeParent, TContext>;

    receivedAt?: ReceivedAtResolver<Maybe<Date>, TypeParent, TContext>;

    readAt?: ReadAtResolver<Maybe<Date>, TypeParent, TContext>;
  }

  export type UserResolver<
    R = UserDb,
    Parent = RecipientDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type MessageResolver<
    R = MessageDb,
    Parent = RecipientDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type ChatResolver<
    R = ChatDb,
    Parent = RecipientDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type ReceivedAtResolver<
    R = Maybe<Date>,
    Parent = RecipientDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
  export type ReadAtResolver<
    R = Maybe<Date>,
    Parent = RecipientDb,
    TContext = AppContext
  > = Resolver<R, Parent, TContext>;
}

export namespace MutationResolvers {
  export interface Resolvers<TContext = AppContext, TypeParent = {}> {
    updateUser?: UpdateUserResolver<UserDb, TypeParent, TContext>;

    addChat?: AddChatResolver<Maybe<ChatDb>, TypeParent, TContext>;

    addGroup?: AddGroupResolver<Maybe<ChatDb>, TypeParent, TContext>;

    updateGroup?: UpdateGroupResolver<Maybe<ChatDb>, TypeParent, TContext>;

    removeChat?: RemoveChatResolver<Maybe<string>, TypeParent, TContext>;

    addMessage?: AddMessageResolver<Maybe<MessageDb>, TypeParent, TContext>;

    removeMessages?: RemoveMessagesResolver<
      Maybe<(Maybe<string>)[]>,
      TypeParent,
      TContext
    >;

    addMembers?: AddMembersResolver<
      Maybe<(Maybe<string>)[]>,
      TypeParent,
      TContext
    >;

    removeMembers?: RemoveMembersResolver<
      Maybe<(Maybe<string>)[]>,
      TypeParent,
      TContext
    >;

    addAdmins?: AddAdminsResolver<
      Maybe<(Maybe<string>)[]>,
      TypeParent,
      TContext
    >;

    removeAdmins?: RemoveAdminsResolver<
      Maybe<(Maybe<string>)[]>,
      TypeParent,
      TContext
    >;

    setGroupName?: SetGroupNameResolver<Maybe<string>, TypeParent, TContext>;

    setGroupPicture?: SetGroupPictureResolver<
      Maybe<string>,
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
    R = UserDb,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, UpdateUserArgs>;
  export interface UpdateUserArgs {
    name?: Maybe<string>;

    picture?: Maybe<string>;
  }

  export type AddChatResolver<
    R = Maybe<ChatDb>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, AddChatArgs>;
  export interface AddChatArgs {
    userId: string;
  }

  export type AddGroupResolver<
    R = Maybe<ChatDb>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, AddGroupArgs>;
  export interface AddGroupArgs {
    userIds: string[];

    groupName: string;

    groupPicture?: Maybe<string>;
  }

  export type UpdateGroupResolver<
    R = Maybe<ChatDb>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, UpdateGroupArgs>;
  export interface UpdateGroupArgs {
    chatId: string;

    groupName?: Maybe<string>;

    groupPicture?: Maybe<string>;
  }

  export type RemoveChatResolver<
    R = Maybe<string>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, RemoveChatArgs>;
  export interface RemoveChatArgs {
    chatId: string;
  }

  export type AddMessageResolver<
    R = Maybe<MessageDb>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, AddMessageArgs>;
  export interface AddMessageArgs {
    chatId: string;

    content: string;
  }

  export type RemoveMessagesResolver<
    R = Maybe<(Maybe<string>)[]>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, RemoveMessagesArgs>;
  export interface RemoveMessagesArgs {
    chatId: string;

    messageIds?: Maybe<(Maybe<string>)[]>;

    all?: Maybe<boolean>;
  }

  export type AddMembersResolver<
    R = Maybe<(Maybe<string>)[]>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, AddMembersArgs>;
  export interface AddMembersArgs {
    groupId: string;

    userIds: string[];
  }

  export type RemoveMembersResolver<
    R = Maybe<(Maybe<string>)[]>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, RemoveMembersArgs>;
  export interface RemoveMembersArgs {
    groupId: string;

    userIds: string[];
  }

  export type AddAdminsResolver<
    R = Maybe<(Maybe<string>)[]>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, AddAdminsArgs>;
  export interface AddAdminsArgs {
    groupId: string;

    userIds: string[];
  }

  export type RemoveAdminsResolver<
    R = Maybe<(Maybe<string>)[]>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, RemoveAdminsArgs>;
  export interface RemoveAdminsArgs {
    groupId: string;

    userIds: string[];
  }

  export type SetGroupNameResolver<
    R = Maybe<string>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, SetGroupNameArgs>;
  export interface SetGroupNameArgs {
    groupId: string;
  }

  export type SetGroupPictureResolver<
    R = Maybe<string>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, SetGroupPictureArgs>;
  export interface SetGroupPictureArgs {
    groupId: string;
  }

  export type MarkAsReceivedResolver<
    R = Maybe<boolean>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, MarkAsReceivedArgs>;
  export interface MarkAsReceivedArgs {
    chatId: string;
  }

  export type MarkAsReadResolver<
    R = Maybe<boolean>,
    Parent = {},
    TContext = AppContext
  > = Resolver<R, Parent, TContext, MarkAsReadArgs>;
  export interface MarkAsReadArgs {
    chatId: string;
  }
}

/** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  SkipDirectiveArgs,
  AppContext
>;
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean;
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  IncludeDirectiveArgs,
  AppContext
>;
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean;
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  DeprecatedDirectiveArgs,
  AppContext
>;
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string;
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
  name: "Date";
}

export interface IResolvers<TContext = AppContext> {
  Query?: QueryResolvers.Resolvers<TContext>;
  User?: UserResolvers.Resolvers<TContext>;
  Chat?: ChatResolvers.Resolvers<TContext>;
  Message?: MessageResolvers.Resolvers<TContext>;
  Recipient?: RecipientResolvers.Resolvers<TContext>;
  Mutation?: MutationResolvers.Resolvers<TContext>;
  Date?: GraphQLScalarType;
}

export interface IDirectiveResolvers<Result> {
  skip?: SkipDirectiveResolver<Result>;
  include?: IncludeDirectiveResolver<Result>;
  deprecated?: DeprecatedDirectiveResolver<Result>;
}
