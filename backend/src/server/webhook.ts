const express = require("express");
const config = require("config");

const kafka = require("kafka-node");
const kafkaClientConfig: { kafkaHost: string, connectTimeout: number, requestTimeout: number, sasl?: { mechanism: string, username: string, password: string } } = {
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
  console.log(`Starting webhook producer on Kafka Broker: ${config.get("kafka.username")}:${config.get("kafka.broker")}`);
} else {
  console.log(`Starting webhook producer service on Kafka Broker: ${config.get("kafka.broker")}`);
}
const kafkaClient = new kafka.KafkaClient(kafkaClientConfig);

const producer = new kafka.Producer(kafkaClient);
producer.on("ready", () => {
  console.log("Kafka Webhook Producer is connected and ready.");
});

const router = express.Router();

export default function apiRoutes() {
  router.post("/", async (req, res) => {
    try {
      const kafkaPayload = [
        {
          topic: "webhook",
          key: req.body.project?.id || req.body.project_id || "N/A",
          messages: JSON.stringify({
            ...req.body,
            id: req.headers["x-gitlab-event-uuid"],
            timestamp_received: new Date().getTime(),
          }),
        },
      ];

      producer.send(kafkaPayload, (err, data) => {
        if (err) {
          console.log("Error sending payload to Kafka: " + err);
        }

        // Send a success response
        res.json({ status: "ok" });
      });
    } catch (error) {
      console.error("Error indexing data into Elasticsearch:", error);
      //res.status(500).json({ status: "error", error: error.message });
      res.json({ status: "failed", error });
    }
  });
  return router;
}