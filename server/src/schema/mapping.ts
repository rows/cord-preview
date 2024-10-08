import type {
  Location,
  ElementIdentifierVersion,
  EntityMetadata,
  JsonObject,
  JsonValue,
  MessageContent,
  PageContext,
  SimpleValue,
  UUID,
  NotificationListFilter,
  SimpleTranslationParameters,
} from 'common/types/index.ts';
import type { FileEntity } from 'server/src/entity/file/FileEntity.ts';
import type { LoadMessagesResultData } from 'server/src/schema/load_messages_result.ts';
import type { MessageEntity } from 'server/src/entity/message/MessageEntity.ts';
import type { MessageAttachmentEntity } from 'server/src/entity/message_attachment/MessageAttachmentEntity.ts';
import type { MessageReactionEntity } from 'server/src/entity/message_reaction/MessageReactionEntity.ts';
import type { OrgEntity } from 'server/src/entity/org/OrgEntity.ts';
import type { PageVisitorEntity } from 'server/src/entity/page_visitor/PageVisitorEntity.ts';
import type { SlackChannelEntity } from 'server/src/entity/slack_channel/SlackChannelEntity.ts';
import type { TaskEntity } from 'server/src/entity/task/TaskEntity.ts';
import type { TaskThirdPartyReference } from 'server/src/entity/task_third_party_reference/TaskThirdPartyReferenceEntity.ts';
import type { TaskTodoEntity } from 'server/src/entity/task_todo/TaskTodoEntity.ts';
import type { ThreadEntity } from 'server/src/entity/thread/ThreadEntity.ts';
import type { ThreadParticipantEntity } from 'server/src/entity/thread_participant/ThreadParticipantEntity.ts';
import type { PubSubEvent } from 'server/src/pubsub/index.ts';
import type { ThirdPartyConnectionArguments } from 'server/src/schema/third_party_connection.ts';
import type { S3BucketEntity } from 'server/src/entity/s3_bucket/S3BucketEntity.ts';
import type { HeimdallEntity } from 'server/src/entity/heimdall/HeimdallEntity.ts';
import type { ApplicationEntity } from 'server/src/entity/application/ApplicationEntity.ts';
import type { UserEntity } from 'server/src/entity/user/UserEntity.ts';
import type { UserLocation } from 'server/src/public/subscriptions/presence_live_query.ts';
import type { ConsoleUserEntity } from 'server/src/entity/user/ConsoleUserEntity.ts';
import type { JsonObjectReducerData } from 'common/util/jsonObjectReducer.ts';
import type { AdminCRTCustomerIssueEntity } from 'server/src/entity/admin_crt/AdminCRTCustomerIssueEntity.ts';
import type { AdminCRTCustomerIssueChangeEntity } from 'server/src/entity/admin_crt/AdminCRTCustomerIssueChangeEntity.ts';
import type { MessageLinkPreviewEntity } from 'server/src/entity/message_link_preview/MessageLinkPreviewEntity.ts';
import type {
  ThreadCollectionFilter,
  ThreadCounts,
} from 'server/src/entity/thread/ThreadLoader.ts';
import type { CustomerEntity } from 'server/src/entity/customer/CustomerEntity.ts';

// Mapping is a type object that defines a way of remapping graphql types to
// our types (usually entities). If you are introducing a new graphql object
// and you need to write any resolver function, then you need to add a new
// entry for this type object in the form:
//
// YourGraphqlObjectName: TypeOfObject
//
// The auto-generated graphql resolvers type will then ensure that:
// 1. Your resolve function's 1st argument will be typed as TypeOfObject
// 2. Any resolver for a graphql field of type YourGraphqlObjectName will need
//    to return TypeOfObject
// 3. The autogenerated Resolvers['YourGraphqlObjectName'] will require you to
//    define resolvers for fields that are defined on YourGraphqlObjectName but
//    not on TypeOfObject
export type Mapping = {
  // scalar types
  String: string;
  Boolean: boolean;
  DateTime: Date;
  Float: number;
  SimpleValue: SimpleValue;
  JSON: JsonValue;
  JSONObject: JsonObject;
  Context: Location;
  Metadata: EntityMetadata;
  SimpleTranslationParameters: SimpleTranslationParameters;
  UUID: UUID;
  Int: number;
  MessageContent: MessageContent;
  ElementIdentifierVersion: ElementIdentifierVersion;
  JsonObjectReducerData: JsonObjectReducerData;

  // query types
  Query: never;
  Mutation: never;
  Subscription: never;

  // object and union types
  ChromeExtension: Record<string, never>;
  Customer: CustomerEntity;
  File: FileEntity;
  Inbox: Record<string, never>;
  LinkedOrganization: OrgEntity;
  LoadMessagesResult: LoadMessagesResultData;
  Message: MessageEntity;
  MessageAnnotationAttachment: MessageAttachmentEntity;
  MessageAttachment: MessageAttachmentEntity | MessageLinkPreviewEntity;
  MessageFileAttachment: MessageAttachmentEntity;
  MessageScreenshotAttachment: MessageAttachmentEntity;
  MessageLinkPreview: MessageLinkPreviewEntity;
  MessageReaction: MessageReactionEntity;
  Organization: OrgEntity;
  PageContext: PageContext;
  PageEvent: PubSubEvent<
    // this must map to the list of triggers in pageEventsWithLocationSubscriptionResolver
    | 'page-thread-deleted'
    | 'page-thread-added-with-location'
    | 'thread-filterable-properties-updated'
  >;
  PageThreadAdded: PubSubEvent<'page-thread-added-with-location'>;
  PageThreadDeleted: PubSubEvent<'page-thread-deleted'>;
  PageThreadReplyAdded: Record<string, never>;
  PageThreadResolved: { payload: { threadID: UUID } };
  PageThreadUnresolved: { payload: { threadID: UUID } };
  PageVisitorsUpdated: Record<string, never>;
  ThreadFilterablePropertiesMatch: PubSubEvent<'thread-filterable-properties-updated'>;
  ThreadFilterablePropertiesUnmatch: PubSubEvent<'thread-filterable-properties-updated'>;
  PageVisitor: PageVisitorEntity;
  SlackChannelSchema: SlackChannelEntity;
  Task: TaskEntity;
  TaskThirdPartyReference: TaskThirdPartyReference;
  ThirdPartyConnection: ThirdPartyConnectionArguments;
  Thread: ThreadEntity;
  ThreadEvent: PubSubEvent<
    // this must map to the list of triggers in threadEventsSubscriptionResolver
    | 'thread-created'
    | 'thread-message-added'
    | 'thread-message-removed'
    | 'thread-message-updated'
    | 'thread-message-content-appended'
    | 'thread-participants-updated-incremental'
    | 'thread-typing-users-updated'
    | 'thread-share-to-slack'
    | 'thread-properties-updated'
    | 'thread-subscriber-updated'
    | 'thread-deleted'
  >;
  ThreadCreated: PubSubEvent<'thread-created'>;
  ThreadDeleted: PubSubEvent<'thread-deleted'>;
  ThreadMessageAdded: PubSubEvent<'thread-message-added'>;
  ThreadMessageRemoved: PubSubEvent<'thread-message-removed'>;
  ThreadMessageUpdated: PubSubEvent<'thread-message-updated'>;
  ThreadMessageContentAppended: PubSubEvent<'thread-message-content-appended'>;
  ThreadParticipant: ThreadParticipantEntity;
  ThreadParticipantsUpdatedIncremental: PubSubEvent<'thread-participants-updated-incremental'>;
  ThreadTypingUsersUpdated: PubSubEvent<'thread-typing-users-updated'>;
  ThreadShareToSlack: PubSubEvent<'thread-share-to-slack'>;
  ThreadPropertiesUpdated: PubSubEvent<'thread-properties-updated'>;
  ThreadSubscriberUpdated: PubSubEvent<'thread-subscriber-updated'>;
  Todo: TaskTodoEntity;
  User: UserEntity;
  UserWithOrgDetails: { user: UserEntity; org: OrgEntity };
  UserLocation: UserLocation;
  Viewer: Record<string, never>;
  ViewerIdentity: Record<string, never>;
  S3BucketVisible: S3BucketEntity;
  HeimdallSwitch: HeimdallEntity;
  Application: ApplicationEntity;
  ApplicationDeploymentInfo: ApplicationEntity;
  AdminChatUser: UserEntity;
  ConsoleUser: ConsoleUserEntity;
  Activity: ThreadCollectionFilter;
  ThreadActivitySummary: ThreadCounts;
  NotificationEvent: PubSubEvent<
    // this must map to the list of triggers in notificationEventsSubscriptionResolver
    | 'notification-added'
    | 'notification-read-state-updated'
    | 'notification-deleted'
  >;
  NotificationAdded: PubSubEvent<'notification-added'>;
  NotificationReadStateUpdated: PubSubEvent<'notification-read-state-updated'>;
  NotificationDeleted: PubSubEvent<'notification-deleted'>;
  CustomerIssue: AdminCRTCustomerIssueEntity;
  CustomerIssueChange: AdminCRTCustomerIssueChangeEntity;
  NotificationSummary: { filter: NotificationListFilter };
  OrgMemberEvent: PubSubEvent<
    // this must map to the list of triggers in orgMembersUpdatedSubscriptionResolver
    'org-member-added' | 'org-member-removed'
  >;
  OrgMemberAdded: PubSubEvent<'org-member-added'>;
  OrgMemberRemoved: PubSubEvent<'org-member-removed'>;
  ApplicationEvent: PubSubEvent<// this must map to the list of triggers in applicationEventTypeResolver
  'console-getting-started-updated'>;
  ConsoleGettingStartedUpdated: PubSubEvent<'console-getting-started-updated'>;
  CustomerEvent: PubSubEvent<// this must map to the list of triggers in customerEventTypeResolver
  'customer-subscription-updated'>;
  CustomerSubscriptionUpdated: PubSubEvent<'customer-subscription-updated'>;
};
