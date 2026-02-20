/// <reference types="vite/client" />

declare interface PushManager {
  getSubscription(): Promise<PushSubscription | null>;
  subscribe(options?: PushSubscriptionOptionsInit): Promise<PushSubscription>;
}

declare interface ServiceWorkerRegistration {
  readonly pushManager: PushManager;
}
