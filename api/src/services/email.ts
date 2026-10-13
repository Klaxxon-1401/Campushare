import { Resend } from 'resend';

/**
 * Email delivery for CampusShare.
 *
 * The driver is chosen at runtime:
 *  - `resend` — real delivery, used when a genuine RESEND_API_KEY is set.
 *  - `log`    — dev fallback that prints the message (incl. OTP codes) to the
 *               server console, so the auth flow works with zero setup.
 *
 * Swapping providers later only means adding another EmailService implementation.
 */

export interface EmailMessage {
  /** Recipient address, or several. */
  to: string | string[];
  subject: string;
  /** HTML body (required). */
  html: string;
  /** Optional plain-text fallback body. */
  text?: string;
}

export interface SendResult {
  /** Provider message id, when the driver returns one. */
  id?: string;
}

export interface EmailService {
  /** Driver name, for logs and diagnostics. */
  readonly driver: 'resend' | 'log';
  send(message: EmailMessage): Promise<SendResult>;
}

/** Sender identity. Set EMAIL_FROM once a domain is verified in Resend. */
const FROM = process.env.EMAIL_FROM || 'CampusShare <onboarding@resend.dev>';

/** Resend's docs placeholder — treat it as "not configured" so we don't try to send. */
const PLACEHOLDER_KEY = /^re_x{6,}$/;

/**
 * True when RESEND_API_KEY holds a real key (not empty, not the `re_xxxxxxxxx`
 * placeholder from the docs).
 */
export const hasResendKey = (): boolean => {
  const key = process.env.RESEND_API_KEY?.trim();
  return Boolean(key) && !PLACEHOLDER_KEY.test(key as string);
};

/** The driver that will be used with the current environment. */
export const emailDriver = (): EmailService['driver'] => (hasResendKey() ? 'resend' : 'log');

const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Resend driver — real delivery.
 *
 * NOTE: with the default `onboarding@resend.dev` sender, Resend will only
 * deliver to the address the Resend account was created with. Verify a domain
 * and set EMAIL_FROM to send to anyone else.
 */
class ResendEmailService implements EmailService {
  readonly driver = 'resend' as const;
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(message: EmailMessage): Promise<SendResult> {
    const { data, error } = await this.client.emails.send({
      from: FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    // Resend returns errors in the payload instead of throwing — check it.
    if (error) {
      throw new Error(`Resend rejected the email (${error.name}): ${error.message}`);
    }
    return { id: data?.id };
  }
}

/** Dev fallback — no account required; prints the message to the console. */
class LogEmailService implements EmailService {
  readonly driver = 'log' as const;

  async send(message: EmailMessage): Promise<SendResult> {
    const to = Array.isArray(message.to) ? message.to.join(', ') : message.to;
    const body = message.text ?? stripHtml(message.html ?? '');
    console.log(`[email:log] to=${to} | subject="${message.subject}" | ${body}`);
    return {};
  }
}

let cached: EmailService | null = null;

/** Returns the configured email driver (Resend when a real key is present). */
export const getEmailService = (): EmailService => {
  if (cached) return cached;
  cached = hasResendKey() ? new ResendEmailService(process.env.RESEND_API_KEY as string) : new LogEmailService();
  return cached;
};

/** Send an email through the configured driver. */
export const sendEmail = (message: EmailMessage): Promise<SendResult> =>
  getEmailService().send(message);

/** Clear the cached driver (used by tests when env changes). */
export const resetEmailService = (): void => {
  cached = null;
};
