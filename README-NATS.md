## NATS consumers implementation guideline

This repository contains an example on how to implement NATS consumers leveraging `@letsdeel/nats-lib`. The important files to understand the implementation are:
- [src/main-nats.ts](https://github.com/letsdeel/service-template/blob/dev/src/main-nats.ts)
- [src/modules/hello/hello.consumer.ts](https://github.com/letsdeel/service-template/blob/dev/src/modules/hello/hello.consumer.ts)
- [src/common/nats](https://github.com/letsdeel/service-template/blob/dev/src/common/nats)

Today the suggested standard assumes a single entrypoint, e.g. `main-nats.ts`, for all of your consumers. This entrypoint accepts a command line argument array specifying one or more consumers to be executed in parallel.
If no consumer is specified, this entrypoint will execute all available consumers in `AppModule` in parallel.

# How to add a new nats consumer?

For all consumers, the required steps would be:
1. Create a new injectable consumer extending [BaseNatsConsumer](https://github.com/letsdeel/service-template/blob/dev/src/common/nats/base-nats.consumer.ts), defining your message handler logic and the configuration attributes
2. Add the created consumer to a module that is imported into `AppModule`
3. Add the name of the created consumer to the `CONSUMERS` constant in [src/main-nats.ts](https://github.com/letsdeel/service-template/blob/dev/src/main-nats.ts)
4. Setup the new consumer in `gitops-applications` for respective service ([example PR](https://github.com/letsdeel/gitops-applications/pull/2906/files#diff-316db2126239f78200e7b4911df6c44d31459db2e3a313ca58e22fe604fde325R68-R71)), with the following command:
```
node -r @letsdeel/init dist/src/main-nats.js <NEW_CONSUMER_NAME>
```


## Example 1: Creating NATS consumer in an existing module

Assume you have an existing module `UserModule` with its own providers, imports, and exports, and also that this module is already imported by `AppModule`.
You want to create a new consumer `UserEventsConsumer`, to do so:

1. Create `UserEventsConsumer` extending [BaseNatsConsumer](https://github.com/letsdeel/service-template/blob/dev/src/common/nats/base-nats.consumer.ts)
2. Add `UserEventsConsumer` to the `providers` list for `UserModule`
3. Add `UserEventsConsumer` to the `CONSUMERS` constant in [src/main-nats.ts](https://github.com/letsdeel/service-template/blob/dev/src/main-nats.ts)
5. Setup the new consumer in `gitops-applications` for respective service ([example PR](https://github.com/letsdeel/gitops-applications/pull/2906/files#diff-316db2126239f78200e7b4911df6c44d31459db2e3a313ca58e22fe604fde325R68-R71)), with the following command:
```
node -r @letsdeel/init dist/src/main-nats.js UserEventsConsumer
```

## Example 2: Creating NATS consumer in a new module

Imagine you want to setup a new consumer called `ContractStatusConsumer`, but there is no module for such domain in the project. These are the required steps:

1. Create `ContractStatusConsumer` extending [BaseNatsConsumer](https://github.com/letsdeel/service-template/blob/dev/src/common/nats/base-nats.consumer.ts)
2. Create a new module `ContractStatusModule`, and add `ContractStatusConsumer` to its `providers` list, and any other dependencies the module requires
3. Add the `ContractStatusModule` to the `imports` list for `AppModule` (NATS entrypoint will search the dependency tree to find the consumer)
4. Add `ContractStatusConsumer` to the `CONSUMERS` constant in [src/main-nats.ts](https://github.com/letsdeel/service-template/blob/dev/src/main-nats.ts)
5. Setup the new consumer in `gitops-applications` for respective service ([example PR](https://github.com/letsdeel/gitops-applications/pull/2906/files#diff-316db2126239f78200e7b4911df6c44d31459db2e3a313ca58e22fe604fde325R68-R71)), with the following command:
```
node -r @letsdeel/init dist/src/main-nats.js ContractStatusConsumer
```

## Example 3: Running multiple NATS consumers in the same pod

Assuming you have the following values in your [src/main-nats.ts](https://github.com/letsdeel/service-template/blob/dev/src/main-nats.ts):

```
// src/main-nats.ts
...
const CONSUMERS: Array<any> = [
    UserEventsModule,
    ContractStatusConsumer,
    ContractCreationConsumer,
    ContractUpdateConsumer,
    ...
];
...
```

You could all the contract related consumers in parallel by running the following command:
```
node -r @letsdeel/init dist/src/main-nats.js ContractStatusConsumer ContractCreationConsumer ContractUpdateConsumer
```


### Note

The current setup allows new consumers to be created with minimal changes. Focus should lie on the consumer logic itself, there should be no need to update any files in [src/common/nats](https://github.com/letsdeel/service-template/blob/dev/src/common/nats) nor update the logic in [src/main-nats.ts](https://github.com/letsdeel/service-template/blob/dev/src/main-nats.ts).