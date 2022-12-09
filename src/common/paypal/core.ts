import paypal, {
  ConfigureOptions,
  payment,
  Payment,
  QueryParameters,
  RefundRequest,
  UpdateRequest,
} from 'paypal-rest-sdk';
import ExecuteRequest = payment.ExecuteRequest;

export default class PayPal {
  private options: ConfigureOptions;
  public paypal: typeof paypal;
  constructor(options: ConfigureOptions) {
    this.options = options;
    this.paypal = paypal;
    this.init();
  }

  public init() {
    this.paypal.configure(this.options);
  }
  #callback(resolve: (_: any) => void, reject: (_: any) => void) {
    return (err: any, res: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    };
  }

  public getPayment = async (id: string) => {
    return new Promise((resolve, reject) => {
      this.paypal.payment.get(id, this.#callback(resolve, reject));
    });
  };

  public getPayments = async (data: QueryParameters) => {
    return new Promise((resolve, reject) => {
      this.paypal.payment.list(data, this.#callback(resolve, reject));
    });
  };

  public createPayment = async (data: Payment) => {
    return new Promise((resolve, reject) => {
      this.paypal.payment.create(data, this.#callback(resolve, reject));
    });
  };

  public executePayment = async (id: string, data: ExecuteRequest) => {
    return new Promise((resolve, reject) => {
      this.paypal.payment.execute(id, data, this.#callback(resolve, reject));
    });
  };

  public updatePayment = async (id: string, data: UpdateRequest[]) => {
    return new Promise((resolve, reject) => {
      this.paypal.payment.update(id, data, this.#callback(resolve, reject));
    });
  };

  public getCapture = async (id: string) => {
    return new Promise((resolve, reject) => {
      this.paypal.capture.get(id, this.#callback(resolve, reject));
    });
  };

  public refundCapture = async (id: string, data: RefundRequest) => {
    return new Promise((resolve, reject) => {
      this.paypal.capture.refund(id, data, this.#callback(resolve, reject));
    });
  };

  public getSubscriptionPlans = async (data: any) => {
    return new Promise((resolve, reject) => {
      this.paypal.billingPlan.list(data, this.#callback(resolve, reject));
    });
  };

  public getSubscriptionPlan = async (id: string) => {
    return new Promise((resolve, reject) => {
      this.paypal.billingPlan.get(id, this.#callback(resolve, reject));
    });
  };

  public createSubscriptionPlan = async (data: any) => {
    return new Promise((resolve, reject) => {
      this.paypal.billingPlan.create(data, this.#callback(resolve, reject));
    });
  };

  public updateSubscriptionPlan = async (planId: string, data: any) => {
    return new Promise((resolve, reject) => {
      this.paypal.billingPlan.update(planId, data, this.#callback(resolve, reject));
    });
  };

  public createSubscriptionPayment = async (data: any) => {
    return new Promise((resolve, reject) => {
      this.paypal.billingAgreement.create(data, this.#callback(resolve, reject));
    });
  };

  public updateSubscriptionPayment = async (id: string, data: any) => {
    return new Promise((resolve, reject) => {
      this.paypal.billingAgreement.update(id, data, this.#callback(resolve, reject));
    });
  };

  public getSubscriptionPayment = async (id: string) => {
    return new Promise((resolve, reject) => {
      this.paypal.billingAgreement.get(id, this.#callback(resolve, reject));
    });
  };

  public cancelSubscriptionPayment = async (id: string, data: any) => {
    return new Promise((resolve, reject) => {
      this.paypal.billingAgreement.cancel(id, data, this.#callback(resolve, reject));
    });
  };
}
