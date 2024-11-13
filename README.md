# Guidelines for setting up new service

We assume that you have successfully completed the approval process as outlined in the [Service Approval Guide](https://wiki.deel.network/i/6545). With all necessary authorizations in place, we are now ready to proceed with the deployment of your new service. This document outlines the subsequent steps to ensure a smooth and efficient implementation.

## Provisioning a new service is primarily categorized into three steps:
**Note:** New service creation process in owned and managed by Infra team. Infra team will help to facilitate the process.

- [ ] Create a channel named `#temp-<service-name>-deployment` for streamlined communcation between multiple teams.
- [ ] Creating the GitHub Repository: This step requires coordination with the Devops team representative in the channel created above.
- [ ] Provisioning the Database: This step requires coordination with the DBA team representative in the channel created above.
- [ ] Launching the Service to the Environment: This step requires coordination with the Infra team representative in the channel created above.

## Creating the GH Repository (DevOps)
**Note:** The DevOps team will create the service repository. Developers need to validate the following settings in the repository.

To ensure consistent structure for all service repositories regarding branches and permissions, developers MUST use the template repository when creating new repositories. This template sets up repository permissions according to policy and creates the dev and master branches.

- [ ] GH repo was created using the service template.
- [ ] The name should NOT include the word `service`
- [ ] following teams should be configured with permissions
    - [ ] @letsdeel/backend - write
    - [ ] @letsdeel/db-admins - write
    - [ ] @letsdeel/devops - admin
    - [ ] @letsdeel/infra-eng - admin
    - [ ] @letsdeel/developers - write
    - [ ] @letsdeel/observers - readonly
- [ ] auto branch deletion after PR merge should be enabled
- [ ] branch protection for master should be configured
- [ ] Edit the CODEOWNERS file and add the respected teams/modify the paths where relevant


## Provisioing the ECR Repository (Infra Eng)
**Note:** Infra team will be opening the PR for service to create a new ECR repository as part of launching the service to the environment. The Devops team manages ECR repositories for services. To create a new service, Infra team need to submit a PR in the [terraform-infra](https://github.com/letsdeel/terraform-infra) repository. Follow the [guide here](https://github.com/letsdeel/terraform-infra?tab=readme-ov-file#submitting-a-pull-request)

- [ ] Create a PR for provisioning new ECR Repo for service. [Example] (https://github.com/letsdeel/terraform-infra/pull/497/files)

## Secrets (Owner team + Infra review)
The Infra team will create the secrets, which will be accessible through the Giger UI to the Team Leads and Directors. It responsibility of service owners to setup the secrets. Infra team will do a one time validation before deployment.

- [ ] Modify the variables in the secrets for every environment.
- [ ] Infra team reviwed the secrets.

## Infrastructure Provisioning (Infra Eng)
When submitting a request to the Infra team for setting up the infrastructure in a given environment, ensure you have already prepared a checklist of requirements.

- [ ] Service will have any endpoint not behind the backend proxy. If yes, this need to be reviwed by InfoSec team. For example: external webhook handlers
- [ ] Service will have cronjobs. If yes, provide cronjob runner file
- [ ] service will have RabbitMQ queue consumers. If yes, provide consumer entrypoint file
- [ ] Service will have NATS Jetsteam consumers. If yes, provide consumer entrypoint file
- [ ] Service is using DB. If yes, provide the migration script command

**Note:** We provision infrastructure using Helm charts. Infra team maintains [standard helm chart template](https://github.com/letsdeel/gitops-applications/tree/dev/lib/helm-chart-template) and will setup your own service Helm chart 

## Service Checklist (Owner team + Infra review)

- [ ] “name” field in `package.json` should have same value as GH repo name.
- [ ] must have a `README.md` file
- [ ] There should be `.env.example` file listing all environment variables and their defaults or dummy values
- [ ] use standard `Dockerfile` from template repo and verify the following:
    - [ ] `CODEARTIFACT_TOKEN` should be a build arg
    - [ ] use `npm ci`
    - [ ] use multistage builds, but keep the number of layers low
    - [ ] base image should be `slim` or `alpine`, e.g. `node:20-slim` or `node:20-alpine`
    - [ ] use private ECR registry instead of Dockerhub
    - [ ] specify `USER node`
    - [ ] entry point should be node process, NOT npm script - this is needed so SIGTERM is correctly handled by node
    - [ ] must require `@letsdeel/init`, in such way Infra controls some standard setup
    - [ ] must set ENV `NODE_ENV=production` in final image
- [ ] must have liveness and readiness probes. See [example 1](https://github.com/letsdeel/mobility/pull/115), [example 2](https://github.com/letsdeel/payroll-processing-worker/pull/84/files#diff-841254fe75488c1bd4cd7f68f00b4be0e48dcfbc4a16b45847b68295e0e3b27bR31)
- [ ] if you are using a Nats Jetstream consumer, it's essential to implement proper handling for graceful shutdown in the consumer. Check [nats-lib](https://github.com/letsdeel/nats-lib/blob/master/src/utils/startGracefulShutdown.ts)
- [ ] if this publishes messages to Nats, ensure you properly disconnect the connections shutdown happens
- [ ] if http server, it's essential to implement proper handling for graceful shutdown. You can copy [this block from backend repo](https://github.com/letsdeel/backend/blob/dev/server.js#L37-L57) or if you are using Nest.js [enable shutdown hooks](https://github.com/letsdeel/payroll-control-center/blob/6ed352de6b4018ed10457812dd879f02c69deecf/src/app.ts#L29)
- [ ] should explicitly connect to all dependencies like RabbitMQ, Nats, DB, Redis on startup, better to fail early than in the middle of the request. Lazy init is delayed bomb. This is especially important for apps with DI system
- [ ] should use global `log` that comes from `@letsdeel/init` package. It is [Pino](https://github.com/pinojs/pino) and is a mandatory standard
- [ ] should setup async tracing, [example](https://github.com/letsdeel/employment/blob/50e3c5f635623fc60f33aa02170a80e5ec96c672/src/app.ts#L143-L176)
- [ ] Working with the database
    - [ ] Read [DB best practices guide](https://wiki.deel.network/i/4969) by DBA team
    - [ ] Sequelize is the only allowed ORM
    - [ ] Utilize the Read Replicas [example](https://github.com/letsdeel/backend/blob/515f0438320d460120be1a66d2a6a32d6f92ac63/db.js#L139)
    - [ ] Set context on the SQL session for audit purposes [example](https://github.com/letsdeel/backend/blob/515f0438320d460120be1a66d2a6a32d6f92ac63/db.js#L108)
    - [ ] Use a connection pool idle timeout of (at least) 1 minute [example](https://github.com/letsdeel/backend/blob/515f0438320d460120be1a66d2a6a32d6f92ac63/db.js#L145)
    - [ ] Set application_name [example](https://github.com/letsdeel/backend/blob/515f0438320d460120be1a66d2a6a32d6f92ac63/db.js#L136)


## Provisioning the Database (Owner team + DBA review)

Steps need to be followed in order by the service owner team:

- [ ] Decide whether service needs a new schema or separate new database [Working with Schemas](https://wiki.deel.network/i/9605)
- [ ] Define the DB user and permissions for the new service user [DB Role Separation](https://wiki.deel.network/en/deel-workspace/engineering/teams/database/postgres/Role-Separation)
- [ ] deploy the `dbutils` PR which was raised in above step.
- [ ] Audit considerations - We have auto-audit enabled, meaning all new schemas/tables are audited automatically. Since audit is resource consuming - if some tables should be excluded from audit (i.e log, cache, static tables, tables we clean and fill on schedule etc.) - see [audit configuration](https://github.com/letsdeel/audit?tab=readme-ov-file#configuration)
- [ ] Tag and anonymize any column containing sensitive information - from the get go and for future columns - see in [DBDocs](https://wiki.deel.network/en/deel-workspace/engineering/teams/database/postgres/DBDocs)

Once the above steps are done reach out to DBA team representative in the channel created above.

- [ ] Creating DB credentials for the service for each envvironment.
- [ ] Final review of the DB setup.