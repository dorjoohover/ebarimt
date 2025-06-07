import { Request } from 'express';

export class Client {
  token: string;
  accessToken: string;
  type: string;
  clientId: string;
  username: string;
  password: string;
  district: string;
  regNo: string;
  tin: string;
  _id: string;
  role: string;
}

// export class MainUser {
//   // Merchant user
//   app: 'merchant' | 'dash';
//   client: Client;
// }

// export class TerminalUser {
//   client?: Client;
//   terminal: Terminal;
// }

export interface MainRequest extends Request {
  user: Client;
}

// export interface TerminalRequest extends Request {
//   user: TerminalUser;
// }
