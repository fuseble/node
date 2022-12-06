import FormData from 'form-data';
import qrcode, { QRCodeOptions, QRCodeSegment, QRCodeToStringOptions } from 'qrcode';

export class QRCode {
  public static createQRCode = async (text: string | QRCodeSegment[], options?: QRCodeOptions) =>
    qrcode.toDataURL(text, options);

  public static parseQRCode = async (text: string, options?: QRCodeToStringOptions) => qrcode.toString(text, options);
}
