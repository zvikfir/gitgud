import config from "config";
import kafka from "kafka-node";

let kafkaClient: kafka.KafkaClient | null = null;
let kafkaProducer: kafka.Producer | null = null;
let consumerGroup: kafka.ConsumerGroup | null = null;

export function getKafkaClient(): kafka.KafkaClient {
  if (!kafkaClient) {
    const kafkaClientConfig: any = {
      kafkaHost: config.get("kafka.broker"),
      connectTimeout: 3000,
      requestTimeout: 3000,
    };
    if (config.has("kafka.username") && config.has("kafka.password")) {
      kafkaClientConfig.sasl = {
        mechanism: 'plain',
        username: config.get("kafka.username"),
        password: config.get("kafka.password"),
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
    const consumerOptions: any = {
      kafkaHost: config.get("kafka.broker"),
      groupId: "gitgud-webhook-consumer",
      sessionTimeout: 15000,
      protocol: ["roundrobin"],
      fromOffset: "latest",
    };
    if (config.has("kafka.username") && config.has("kafka.password")) {
      consumerOptions.sasl = {
        mechanism: "plain",
        username: config.get("kafka.username"),
        password: config.get("kafka.password"),
      };
    }
    consumerGroup = new kafka.ConsumerGroup(consumerOptions, topics);
  }
  return consumerGroup;
}
