import admin from 'firebase-admin';
import type { Notification } from 'firebase-admin/lib/messaging/messaging-api';

interface SendMessageProps {
  token: string;
  notification: Notification;
}

type SendMessagesProps = Array<SendMessageProps>;
export class FirebaseMessaging {
  private app: admin.app.App;

  constructor(serviceAccount: any) {
    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  public sendMessage = async ({ token, notification }: SendMessageProps) => {
    return await this.app.messaging().send({
      token,
      notification,
    });
  };

  public sendMessages = async (messages: SendMessagesProps) => {
    return await Promise.all(messages.map(message => this.sendMessage(message)));
  };
}
