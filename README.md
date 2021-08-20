<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>


## Installation

```bash
$ npm install --save nestjs-async-cqrs
```

## Quick Start

[Overview & CQRS Tutorial](https://docs.nestjs.com/recipes/cqrs)

The current CQRS module that ships with NestJS does not allow you to `await` the publishing of an event.
This node module extends the NestJS CQRS module to allow for asynchronous publishing of events.

Example:

```typescript
export class Hero extends AggregateRoot {
  constructor(private readonly id: string) {
    super();
  }

  async killEnemy(enemyId: string) {
    // logic
    await this.apply(new HeroKilledDragonEvent(this.id, enemyId));
  }

  async addItem(itemId: string) {
    // logic
    await this.apply(new HeroFoundItemEvent(this.id, itemId));
  }
}

@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    private readonly repository: HeroRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: KillDragonCommand) {
    console.log(clc.greenBright('KillDragonCommand...'));

    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
    );
    await hero.killEnemy(dragonId);
    await hero.commit();
  }
}

```

This is achieved by modifying the `AggregateRoot`, `EventBus` and `EventPublisher` classes to support `async` methods.


## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

* Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
* Website - [https://nestjs.com](https://nestjs.com/)
* Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
