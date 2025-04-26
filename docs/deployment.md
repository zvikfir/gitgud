# GitGud Deployment Guide

GitGud is designed to integrate seamlessly with Gitlab, providing policy as a service. This means that GitGud helps enforce organizational policies on your Gitlab projects, ensuring compliance and standardization across your development workflows. By leveraging GitGud, you can automate the enforcement of best practices, security policies, and other organizational guidelines.

The deployment process involves setting up both the backend and frontend components, along with necessary integrations such as PostgreSQL for data storage, and Kafka for handling webhook events. Additionally, GitGud requires proper configuration of Gitlab OAuth and service account tokens to interact securely with your Gitlab instance.

At the end of this short guide, you will be able to deploy and perform a sanity check on your GitGud deployment.

### Checklist

- [ ] [FQDN](#fqdn)
- [ ] [Postgresql database](#postgresql)
- [ ] [Kafka broker and topics](#kafka)
- [ ] [Gitlab Application OAuth](#gitlab-oauth-application)
- [ ] [Gitlab Service Account Token](#gitlab-service-account-token)

### FQDN

GitGud integrates with Gitlab using **OAuth Application** and **Webhooks**. For this purpose, we'll need to point Gitlab to GitGud via a fully qualified domain name (FQDN), such as `gitgud.example.com`. This address should be accessible and reachable by the Gitlab service for GitGud to function properly.

The FQDN is crucial because it ensures that Gitlab can communicate with GitGud for authentication and webhook events. Without a properly configured FQDN, GitGud will not be able to receive necessary data from Gitlab, leading to integration failures.

For the rest of this guide, let's assume you will be running GitGud at `https://gitgud.example.com`. Make sure that this domain is correctly configured in your DNS settings and that it points to the server where GitGud is hosted. Additionally, ensure that the domain is secured with an SSL certificate to enable HTTPS.

> Note down the FQDN for use in your environment variables and Gitlab integration.

### PostgreSQL

PostgreSQL is used as the main datastore for GitGud. The backend takes care of database migrations, schema changes, and initial data seeding. PostgreSQL provides a robust and reliable database solution that supports complex queries and transactions.

To set up PostgreSQL, you will need the PostgreSQL connection string URL. Typically, this will look something like `postgresql://username:password@hostname:port/database`. Ensure that PostgreSQL is properly configured and running on your server. 

> Note down the PostgreSQL connection string URL for use in your environment variables.

### Kafka

Kafka is used to handle incoming webhook events from Gitlab. We use a single topic in Kafka to store these events, which allows us to offer parallelism and a more sustained and manageable data stream of events. Kafka provides a high-throughput, low-latency platform for handling real-time data feeds.

To set up Kafka, you will need the broker address. Typically, this will look something like `kafka.example.com:9092`. Ensure that Kafka is properly configured and running on your server. 

> Note down the Kafka broker address for use in your environment variables.

### Gitlab OAuth Application

To configure the Gitlab OAuth Application, follow these steps:

1. Log in to your Gitlab instance.
2. Navigate to `User Settings` > `Applications`.
3. Click on `New Application`.
4. Fill in the following details:
   - **Name**: GitGud
   - **Redirect URI**: `https://gitgud.example.com/gitlab/auth/callback`
   - **Scopes**: Select `api` and `read_user`
5. Click `Save application`.

**Important**: It is highly recommended to use a service account for the OAuth application instead of a personal account. This ensures that the application is not tied to an individual user, which can lead to issues if that user leaves the organization or their account is deactivated. A service account provides a more stable and secure integration.

> Note down the `Application ID` and `Secret` for use in your environment variables.

### Gitlab Service Account Token

To create a Gitlab Service Account Token, follow these steps:

1. Log in to your Gitlab instance.
2. Navigate to `Admin Area` > `Users`.
3. Create a new user with a name like `gitgud-service-account`.
4. Assign the necessary permissions to this user.
5. Log in as the new service account user.
6. Navigate to `User Settings` > `Access Tokens`.
7. Create a new personal access token with the following details:
   - **Name**: GitGud Service Token
   - **Scopes**: Select `api`
8. Click `Create personal access token`.

**Important**: It is crucial to use a service account for the access token instead of a personal account. This ensures that the token is not tied to an individual user, which can lead to issues if that user leaves the organization or their account is deactivated. A service account provides a more stable and secure integration.

> Note down the generated token for use in your environment variables.

