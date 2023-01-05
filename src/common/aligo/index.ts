import axios, { AxiosInstance } from 'axios';

export interface AligoProps {
  key: string;
  userId: string;
  sender: string;
}

export interface AligoMessageProps {
  phoneNumber: string;
  message: string;
}

export class Aligo {
  private userId: string;
  private key: string;
  private sender: string;
  public apiClient: AxiosInstance;

  constructor(props: AligoProps) {
    this.userId = props.userId;
    this.key = props.key;
    this.sender = props.sender;

    this.apiClient = axios.create({
      baseURL: 'https://apis.aligo.in',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  public sendMessage = async ({ phoneNumber, message }: AligoMessageProps) => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const params = new URLSearchParams();
    params.append('user_id', this.userId);
    params.append('key', this.key);
    params.append('sender', this.sender);
    params.append('receiver', phoneNumber);
    params.append('msg', message);
    params.append('msg_type', 'SMS');

    return await this.apiClient.post('/send', params, { headers });
  };

  public sendMessages = async (props: AligoMessageProps[]) => {
    return await Promise.all(props.map(prop => this.sendMessage(prop)));
  };
}
