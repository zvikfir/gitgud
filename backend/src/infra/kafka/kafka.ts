import { getAppConfig } from "../config/configService";
import kafka from "kafka-node";

let kafkaClient: kafka.KafkaClient | null = null;
let kafkaProducer: kafka.Producer | null = null;
let consumerGroup: kafka.ConsumerGroup | null = null;

export function getKafkaClient(): kafka.KafkaClient {
  if (!kafkaClient) {
    const appConfig = getAppConfig();
    const kafkaClientConfig: any = {
      kafkaHost: appConfig.kafka.broker,
      connectTimeout: 3000,
      requestTimeout: 3000,
    };
    // If you add username/password to AppConfig.kafka, add them here as well
    if (appConfig.kafka.username && appConfig.kafka.password) {
      kafkaClientConfig.sasl = {
        mechanism: 'plain',
        username: appConfig.kafka.username,
        password: appConfig.kafka.password,
      };
    }
    kafkaClient = new kafka.KafkaClient(kafkaClientConfig);
  }
  return kafkaClient;
}

export function getKafkaProducer(): kafka.Producer {
  if (!kafkaProducer) {
    kafkaProducer = new kafka.Producer(getKafkaClient());
  }
  return kafkaProducer;
}

export function getConsumerGroup(topics: string[] = ["webhook"]): kafka.ConsumerGroup {
  if (!consumerGroup) {
    const appConfig = getAppConfig();
    const consumerOptions: any = {
      kafkaHost: appConfig.kafka.broker,
      groupId: "gitgud-webhook-consumer",
      sessionTimeout: 15000,
      protocol: ["roundrobin"],
      fromOffset: "latest",
    };
    if (appConfig.kafka.username && appConfig.kafka.password) {
      consumerOptions.sasl = {
        mechanism: "plain",
        username: appConfig.kafka.username,
        password: appConfig.kafka.password,
      };
    }
    consumerGroup = new kafka.ConsumerGroup(consumerOptions, topics);
  }
  return consumerGroup;
}
