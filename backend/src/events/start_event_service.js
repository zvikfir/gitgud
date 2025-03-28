const config = require("config");
const kafka = require("kafka-node");
const on_webhook = require("./on_webhook");

module.exports = async () => {
  const kafkaClientConfig = {
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
  if (config.has("kafka.username") && config.has("kafka.password")) {
    console.log(`Starting start_event_service service on Kafka Broker: ${config.get("kafka.username")}:${config.get("kafka.broker")}`);
  } else {
    console.log(`Starting start_event_service service on Kafka Broker: ${config.get("kafka.broker")}`);
  }
  const kafkaClient = new kafka.KafkaClient(kafkaClientConfig);
  const producer = new kafka.Producer(kafkaClient);
  producer.on("ready", () => {
    producer.createTopics(["webhook"], true, async (err, data) => {
      if (err) {
        console.log("Error creating webhook topic: " + err);
      }

      await on_webhook();
    });
  });

  producer.on("error", (err) => {
    console.error("Kafka Producer error: " + err);
    process.abort();
  });
};
