<div align="center">
  <h1>VOD Craft</h1>
  <p>An orchestration for creating Video on Demand (VOD) from live HLS streams</p>
</div>

## About the project

`VOD Craft` is a scalable, automated solution designed to convert live HLS (HTTP Live Streaming) streams into Video on Demand (VOD) content. The project leverages AWS services and orchestration tools to manage the entire process, from live streaming to VOD creation, enabling quick and efficient video processing. Whether you’re looking to capture live events or build an extensive VOD library, `VOD Craft` provides the necessary tools and workflows to streamline the transformation from live content to on-demand media.

## Project Diagram
For an overview of the architecture and workflow, refer to the diagram below: ![VOD Craft Workflow](diagrams/VOD%20Craft%20Workflow.jpg)

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

Ensure you have the following technologies installed to run this project effectively.

#### NVM

To lock the node version, nvm is used in the project.

```sh
nvm use
nvm install
```

### Installation

To install the monorepo and its dependencies, navigate to the root of the project and run:

```sh
npm install
npx husky init
```

### Configure VOD Craft

All AWS-related resources can be managed with Terraform. A Makefile is included with various commands for creating and deleting AWS resources.

First, set up AWS credentials locally, then pass the credentials to the environment using:

```sh
export set CREDENTIAL_DIR={aws_credentials_dir}
```

#### Makefile Commands

The following commands are available in the `Makefile` for infrastructure management:

| Command  | Description                                                                 |
|----------|-----------------------------------------------------------------------------|
| `init`   | Builds the Lambda function and initializes Terraform using the Docker image.|
| `plan`   | Builds the Lambda function and generates an execution plan using Terraform. |
| `apply`  | Builds the Lambda function and applies the Terraform configuration.         |
| `destroy`| Destroys the Terraform-managed infrastructure using the Docker image.       |

### Example Payload for VOD Craft State Machine

```sh
{
  "live": true,
  "contentId": "{unique_id}",
  "liveEventDuration": "{duration_of_live_event}",
  "sourceHlsUrl": "{live_event_source_hls_url}",
  "mpChannelId": "{mediapackage_channel_id}",
  "live2VOD": true,
  "tenant": "{deployed_environment_name}",
  "harvestingStartTimeUtc": "{harvesting_start_time_in_utc}",
  "harvestingEndTimeUtc": "{harvesting_end_time_in_utc}"
}
```

#### Payload Description

In this payload:

- **live**: Indicates if live streaming is enabled.
- **contentId**: A unique identifier for the content.
- **liveEventDuration**: Duration of the live event in seconds.
- **sourceHlsUrl**: The URL for the live event source HLS stream.
- **mpChannelId**: The media package channel ID.
- **live2VOD**: Determines if live content should be converted to VOD.
- **tenant**: Specifies the deployed environment name.
- **harvestingStartTimeUtc** & **harvestingEndTimeUtc**: UTC timestamps defining the VOD harvesting window.
