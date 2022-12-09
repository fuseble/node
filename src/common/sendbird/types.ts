export type SendBirdUser = {
  userId: string;
  nickname: string;
  isOnline: boolean;
  isActive: boolean;
  phoneNumber: string;
  description: string;
  metadata: any;
  createdAt: number;

  [key: string]: any;
};

export type SendBirdChannel = {
  channelUrl: string;
  name: string;
  data: string;
  coverUrl: string;
  creator: SendBirdUser;
  memberCount: number;
  isPublic: boolean;
  isHidden: boolean;

  [key: string]: any;
};

export type SendBirdUserList = {
  users: SendBirdUser[];
  next: string;
};
