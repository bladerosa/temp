import { makeAutoObservable } from 'mobx';

export class AuthStore {
  email = '';

  constructor() {
    makeAutoObservable(this);
  }

  setEmail = (v: string) => {
    this.email = v;
  };

  maskedEmail = () => {
    const mail = this.email;
    if (!mail || !mail.includes('@')) return mail;
    const [user, domain] = mail.split('@');
    if (user.length <= 3) return mail;
    return `${user.slice(0, 3)}***@${domain}`;
  };

  logout = () => {
    this.email = '';
  };
}
