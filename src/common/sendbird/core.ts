import SendbirdPlatformSdk from 'sendbird-platform-sdk';
import type { SendBirdUserList, SendBirdChannel, SendBirdUser } from './types';

export default class SendBird {
  private apiToken: string;
  private userApi = new SendbirdPlatformSdk.UserApi();
  private groupChannelApi = new SendbirdPlatformSdk.GroupChannelApi();
  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  public getUserList = async (data?: any): Promise<SendBirdUserList> =>
    await this.userApi.listUsers(this.apiToken, data ?? {});

  public getUserById = async (userIds: string | string[]): Promise<SendBirdUserList> =>
    await this.userApi.listUsers(this.apiToken, { userIds });

  public getUserByNickname = async (nickname: string): Promise<SendBirdUserList> =>
    await this.userApi.listUsers(this.apiToken, { nickname });

  public createUser = async (data: any): Promise<SendBirdUser> => await this.userApi.createUser(this.apiToken, data);

  public getChannels = async () => await this.groupChannelApi.gcListChannels(this.apiToken, {});

  public getChannelsByName = async (name: string) => await this.groupChannelApi.gcListChannels(this.apiToken, { name });

  public getChannelsByUserId = async (userIds: string | string[]) =>
    await this.groupChannelApi.gcListChannels(this.apiToken, { userIds });

  public getChannelMembers = async (channelUrl: string) =>
    await this.groupChannelApi.gcListMembers(this.apiToken, channelUrl, {});

  public inviteChannel = async (chnnaleUrl: string, userIds: string | string[]) =>
    await this.groupChannelApi.gcInviteAsMembers(this.apiToken, chnnaleUrl, { userIds });

  public joinChannel = async (channelUrl: string) =>
    await this.groupChannelApi.gcJoinChannel(this.apiToken, channelUrl);

  public leaveChannel = async (channelUrl: string) =>
    await this.groupChannelApi.gcLeaveChannel(this.apiToken, channelUrl, {});
}
