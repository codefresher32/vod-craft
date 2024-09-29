<div align="center">
  <h1>Typescript Monorepo Template</h1>
  <p>A monorepo project template using Typescript, NPM and Turborepo</p>
</div>

## About the project

The aim of this template is to offer a modern TypeScript monorepo example for project, enabling easy configuration of new services using this template.

### Built With

This project uses the following technologies and tools:

- [NPM](https://npm.io/) - Package management
- [Turborepo](https://turbo.build/repo) - High performance build system
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [Typescript](https://www.typescriptlang.org/) - Type-safe codebase
- [ESBuild](https://esbuild.github.io/) - Code build
- [Eslint](https://eslint.org/) - Code linter
- [Jest](https://jestjs.io/) - Frontend & backend test suite
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message standard

## Getting Started

### Prerequisites

Here's a list of technologies that you will need in order to run this project.

#### NVM

To lock the node version, nvm is used in the project.

```sh
nvm use
nvm install
```

### Installation

To install the monorepo and all of its dependencies, simply run the following command at the root of the project.

```sh
npm install
npx husky init
```

### Configure Service

An example Service, named `ts-demo-service`, is provided to demonstrate how to add a new Service using this template.

#### Example Service Structure

| Folder                                | Description                                                   |
| ------------------------------------- | ------------------------------------------------------------- |
| <code>/ services </code>               | The root directory for all Services                           |
| <code> / ts-demo-service </code>      | The directory of service named `ts-demo-service`             |
| <code> / src </code>                  | The source code of service                                     |
| <code>    jest.config.cjs </code>      | The Jest configuration for running test                      |
| <code>    package.json </code>        | The `package.json` for this specific service                   |
| <code>    tsconfig.json </code>       | The configuration for using external libraries in this Service |

#### New Service Creation

To create a new Service using this template, copy and paste the `ts-demo-service` folder into the `services` directory with a new name.
