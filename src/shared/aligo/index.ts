import axios, { AxiosInstance } from 'axios';

interface SendMessageProps {
  phoneNumber: string;
  message: string;
}

type SendMessagesProps = Array<SendMessageProps>;

export class Aligo {
  private userId: string;
  private key: string;
  private sender: string;

  public apiClient: AxiosInstance;

  constructor(userId: string, key: string, sender: string) {
    this.userId = userId;
    this.key = key;
    this.sender = sender;
    this.apiClient = axios.create({
      baseURL: 'https://apis.aligo.in',
    });
  }

  public sendMessage = async ({ phoneNumber, message }: SendMessageProps) => {
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

  public sendMessages = async (props: SendMessagesProps) => {
    return await Promise.all(props.map(prop => this.sendMessage(prop)));
  };
}
