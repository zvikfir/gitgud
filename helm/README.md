# gitgud Helm Chart

## Description

The `gitgud` project Helm chart for deploying a Node.js Express REST API with webhook functionality.

## Chart Details

- **Chart Version:** 0.1.0
- **App Version:** 1.0.0
- **Maintainers:**
  - Name: Itay Weinberger
    - Email: itay@joo.la
- **Keywords:** nodejs, express, rest-api, webhook

## Installation

To install the chart with the release name `my-release`:

```
helm install my-release ./gitgud
```

## Configuration

The following table lists the configurable parameters of the `gitgud` chart and their default values.

| Parameter                  | Description                                      | Default                                            |
|----------------------------|--------------------------------------------------|----------------------------------------------------|
| `replicaCount`             | Number of replicas for the deployment            | `1`                                                |
| `image.repository`         | Docker image repository                          | `gitgud`                                           |
| `image.tag`                | Docker image tag                                 | `latest`                                           |
| `image.pullPolicy`         | Docker image pull policy                         | `IfNotPresent`                                     |
| `ingress.enabled`          | Enable ingress controller resource               | `true`                                             |
| `ingress.annotations`      | Ingress annotations                              | `{kubernetes.io/ingress.class: nginx, cert-manager.io/issuer: gitgud-issuer}` |
| `ingress.hosts`            | Ingress accepted hostnames                       | `[{ host: gitgud.joo.la, paths: [{ path: /, pathType: Prefix }] }]` |
| `ingress.tls`              | Ingress TLS configuration                        | `[{ secretName: gitgud-tls, hosts: [gitgud.joo.la] }]` |
| `gitlabAccessToken`        | GitLab access token                              | `my-gitlab-access-token`                           |
| `elasticsearchUrl`         | URL for Elasticsearch                            | `http://elastic-elasticsearch.gitgud-services.svc.cluster.local:9200` |
| `kafkaBrokerUrl`           | URL for Kafka broker                             | `kafka.gitgud-services.svc.cluster.local:9092`     |

## Values

To override the default values, you can provide a `values.yaml` file:

```
replicaCount: 2
image:
  repository: my-custom-repo/gitgud
  tag: 1.0.1
  pullPolicy: Always
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/issuer: custom-issuer
  hosts:
    - host: custom-domain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: custom-tls
      hosts:
        - custom-domain.com
gitlabAccessToken: "new-gitlab-access-token"
elasticsearchUrl: "http://custom-elasticsearch:9200"
kafkaBrokerUrl: "custom-kafka:9092"
```

Install the chart with the custom values:

```
helm install my-release ./gitgud -f values.yaml
```

## Uninstallation

To uninstall/delete the `my-release` deployment:

```
helm uninstall my-release
```

This removes all the Kubernetes components associated with the chart and deletes the release.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your changes.

