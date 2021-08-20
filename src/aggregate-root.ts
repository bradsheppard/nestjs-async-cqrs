/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { IEvent } from './interfaces';

const INTERNAL_EVENTS = Symbol();
const IS_AUTO_COMMIT_ENABLED = Symbol();

export abstract class AggregateRoot<EventBase extends IEvent = IEvent> {
  public [IS_AUTO_COMMIT_ENABLED] = false;
  private readonly [INTERNAL_EVENTS]: EventBase[] = [];

  set autoCommit(value: boolean) {
    this[IS_AUTO_COMMIT_ENABLED] = value;
  }

  get autoCommit(): boolean {
    return this[IS_AUTO_COMMIT_ENABLED];
  }

  async publish<T extends EventBase = EventBase>(event: T): Promise<void> {}

  async publishAll<T extends EventBase = EventBase>(event: T[]): Promise<void> {}

  async commit(): Promise<void> {
    await this.publishAll(this[INTERNAL_EVENTS]);
    this[INTERNAL_EVENTS].length = 0;
  }

  uncommit() {
    this[INTERNAL_EVENTS].length = 0;
  }

  getUncommittedEvents(): EventBase[] {
    return this[INTERNAL_EVENTS];
  }

  async loadFromHistory(history: EventBase[]): Promise<void> {
    for(const entry of history) {
      await this.apply(entry, true);
    }
  }

  async apply<T extends EventBase = EventBase>(event: T, isFromHistory = false): Promise<void> {
    if (!isFromHistory && !this.autoCommit) {
      this[INTERNAL_EVENTS].push(event);
    }
    this.autoCommit && await this.publish(event);

    const handler = this.getEventHandler(event);
    handler && await handler.call(this, event);
  }

  protected getEventHandler<T extends EventBase = EventBase>(
    event: T,
  ): Function | undefined {
    const handler = `on${this.getEventName(event)}`;
    return this[handler];
  }

  protected getEventName(event: any): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }
}
