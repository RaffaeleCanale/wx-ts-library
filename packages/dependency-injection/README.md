# `@canale/dependency-injection`

A simplistic dependency injection framework that can be used with TypeScript decorators.

## Installation

```sh
yarn add @canale/dependency-injection
```

## Usage

### 0. (Optional) Define type information

This framework allows for some level of type checking. To add type information to your dependencies, you can augment the `Dependencies` interface:

```ts
declare module '@canale/dependency-injection/lib/types' {
    interface Dependencies {
        db: MongoClient;
        eventBus: EventBus;
        server: Server;
        // ...
    }
}
```

### 1. Register your dependencies

```ts
import { register, registerAll } from '@canale/dependency-injection';

register('db', myMongoClient);
register('eventBus', EventBusClass);
register('server', () => initServer());

// or

registerAll({
    db: myMongoClient,
    eventBus: EventBusClass,
    server: () => initServer(),
});
```

### 2. Load your dependencies

This can be done manually:

```ts
import { getDependency } from '@canale/dependency-injection';

const db = getDependency('db');
```

Or through annotations:

```ts
import { inject, injectNamed, injectable } from '@canale/dependency-injection';

@injectable
class MyClass {
    @inject
    private readonly db!: MongoClient;

    // OR

    @injectNamed('db')
    private readonly myDbClient!: MongoClient;
}
```
