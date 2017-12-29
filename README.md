# Trioxis React Form

## Development

This repository uses [Yarn Workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/).

```shell
# Install dependencies across packages
yarn install
```

The core library is found under `./packages/react-form`

### Tests

The library is tested with Jest and Enzyme...

```shell
# Run tests...
yarn test

# Run and watch tests...
yarn test --watch
```

### Docs

Docs are located at `./packages/docs`

```shell
# Run and watch docs...
yarn docs
```

### Code formatting

Code formatting is not yet automated. Code is formatted with [Prettier](https://github.com/prettier/prettier)

```shell
# Format code
yarn run format
```