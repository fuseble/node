import Client from 'sendbird';
import axios, { AxiosInstance } from 'axios';

export default class SendBird {
  private app_id: string;
  private baseURL: string;
  private sb: Client.SendBirdInstance;

  private apiClient: AxiosInstance;

  constructor(app_id: string, api_token: string) {
    this.app_id = app_id;
    this.baseURL = `https://api-${this.app_id}.sendbird.com/v3`;
    this.sb = new Client({ appId: this.app_id });

    this.apiClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Api-Token': api_token,
        'Content-Type': 'application/json; charset=utf8',
      },
    });
  }

  public connect = async (userId: string) => {
    return await new Promise((resolve, reject) => {
      this.sb.connect(userId, (user, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(user);
        }
      });
    });
  };
}
