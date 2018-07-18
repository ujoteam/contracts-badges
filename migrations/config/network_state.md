We are using Migrations in a hacky way as to not overwrite or cause unnecessary saves across networks.

To do this, we basically hack Migrations to purely be deploy scripts.

Each time a deploy is necessary, you remember the current ID of the migrations on the specific network and then write a new one. After it's done, move it to the OLD folder and increment this below.

mainnet is on uid 6
rinkeby is on uid 6
