import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import queryString from 'query-string';
import { type SmartDeliveryCompany, SmartDeliveryTrackingInfo } from './types';

export default class SmartDelivery {
  private apiKey: string;
  private apiClient: AxiosInstance;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiClient = axios.create({
      baseURL: 'http://info.sweettracker.co.kr/api/v1',
      paramsSerializer: params => {
        return queryString.stringify(params, { arrayFormat: 'bracket' });
      },
      params: {
        t_key: this.apiKey,
      },
    });
  }

  public request = (config: AxiosRequestConfig) => this.apiClient.request(config);

  public getCompanies = async (): Promise<SmartDeliveryCompany[]> => {
    const { data } = await this.request({
      method: 'GET',
      url: '/companylist',
    });

    return data.Company;
  };

  public getRecommendCompany = async (invoice: string): Promise<SmartDeliveryCompany[]> => {
    const { data } = await this.request({
      method: 'GET',
      url: '/recommend',
      params: {
        t_invoice: invoice,
      },
    });

    return data.Recommend;
  };

  public getTrackingInfo = async (companyCode: string, invoice: string): Promise<SmartDeliveryTrackingInfo> => {
    const { data } = await this.request({
      method: 'GET',
      url: '/trackingInfo',
      params: {
        t_code: companyCode,
        t_invoice: invoice,
      },
    });

    return data;
  };
}
