import { Resend } from 'resend';

/**
 * Email delivery for CampusShare.
 *
 * Supports multiple Resend API keys mapped to recipient domains.
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
  readonly driver: 'resend' | 'log' | 'multi-resend';
  send(message: EmailMessage): Promise<SendResult>;
}

interface ResendAccountConfig {
  apiKey: string;
  from: string;
}

/** Parse RESEND_API_KEYS env as JSON: { "domain.com": { "apiKey": "...", "from": "Name <email@domain.com>" } } */
const parseResendKeys = (): Map<string, ResendAccountConfig> => {
  const raw = process.env.RESEND_API_KEYS?.trim();
  if (!raw) return new Map();
  try {
    const parsed = JSON.parse(raw);
    const map = new Map<string, ResendAccountConfig>();
    for (const [domain, config] of Object.entries(parsed)) {
      if (config && typeof config === 'object' && 'apiKey' in config && typeof config.apiKey === 'string') {
        const cfg = config as ResendAccountConfig;
        if (cfg.apiKey && !/^re_x{6,}$/.test(cfg.apiKey)) {
          map.set(domain.trim().toLowerCase(), {
            apiKey: cfg.apiKey,
            from: cfg.from || process.env.EMAIL_FROM || 'CampusShare <onboarding@resend.dev>',
          });
        }
      }
    }
    return map;
  } catch {
    console.error('[email] Failed to parse RESEND_API_KEYS JSON');
    return new Map();
  }
};

/** Default sender identity. */
const DEFAULT_FROM = process.env.EMAIL_FROM || 'CampusShare <onboarding@resend.dev>';

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
export const emailDriver = (): EmailService['driver'] => {
  // Multi-key config takes priority over single fallback key
  if (parseResendKeys().size > 0) return 'multi-resend';
  if (hasResendKey()) return 'resend';
  return 'log';
};

/** Test helper: force log driver for local testing. */
let forceLogDriver = false;
export const setForceLogDriver = (enabled: boolean): void => {
  forceLogDriver = enabled;
};
export const isForceLogDriver = (): boolean => forceLogDriver;

const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Single Resend driver — uses the default RESEND_API_KEY.
 */
class ResendEmailService implements EmailService {
  readonly driver = 'resend' as const;
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(message: EmailMessage): Promise<SendResult> {
    const { data, error } = await this.client.emails.send({
      from: DEFAULT_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    if (error) {
      throw new Error(`Resend rejected the email (${error.name}): ${error.message}`);
    }
    return { id: data?.id };
  }
}

/**
 * Multi-key Resend driver — selects API key based on recipient email (exact match first, then domain).
 */
class MultiResendEmailService implements EmailService {
  readonly driver = 'multi-resend' as const;
  private readonly clients: Map<string, { client: Resend; from: string }> = new Map();
  private readonly defaultClient: { client: Resend; from: string } | null = null;

  constructor() {
    const keyMap = parseResendKeys();
    for (const [key, config] of keyMap) {
      this.clients.set(key.trim().toLowerCase(), {
        client: new Resend(config.apiKey),
        from: config.from,
      });
    }
    // Fallback to default key if available
    if (hasResendKey()) {
      this.defaultClient = {
        client: new Resend(process.env.RESEND_API_KEY as string),
        from: DEFAULT_FROM,
      };
    }
  }

  private getClientForEmail(to: string | string[]): { client: Resend; from: string } | null {
    const recipients = Array.isArray(to) ? to : [to];
    const first = recipients[0]?.toLowerCase();
    if (!first) return this.defaultClient;

    // 1. Try exact email match first (for per-account keys like 25cu0310103@domain)
    if (this.clients.has(first)) {
      return this.clients.get(first)!;
    }

    // 2. Fall back to domain match
    const domain = first.split('@')[1];
    if (domain && this.clients.has(domain)) {
      return this.clients.get(domain)!;
    }

    return this.defaultClient;
  }

  async send(message: EmailMessage): Promise<SendResult> {
    const clientInfo = this.getClientForEmail(message.to);
    if (!clientInfo) {
      // No key configured for this domain and no fallback — throw to trigger log fallback upstream
      throw new Error(`No Resend API key configured for recipient domain`);
    }

    const { data, error } = await clientInfo.client.emails.send({
      from: clientInfo.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

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

/** Returns the configured email driver (multi-resend > resend > log). */
export const getEmailService = (): EmailService => {
  if (cached) return cached;
  if (isForceLogDriver()) {
    cached = new LogEmailService();
    return cached;
  }
  const keyMap = parseResendKeys();
  if (keyMap.size > 0) {
    cached = new MultiResendEmailService();
  } else if (hasResendKey()) {
    cached = new ResendEmailService(process.env.RESEND_API_KEY as string);
  } else {
    cached = new LogEmailService();
  }
  return cached;
};

/** Send an email through the configured driver. */
export const sendEmail = (message: EmailMessage): Promise<SendResult> =>
  getEmailService().send(message);

/** Clear the cached driver (used by tests when env changes). */
export const resetEmailService = (): void => {
  cached = null;
};
