import { getKafkaProducer } from "../infra/kafka/kafka";
import { onWebhook } from "./on_webhook";

const startEventService = async () => {
  const producer = getKafkaProducer();
  producer.on("ready", () => {
    producer.createTopics(["webhook"], true, async (err: any, data: any) => {
      if (err) {
        console.log("Error creating webhook topic: " + err);
      }
      await onWebhook();
    });
  });

  producer.on("error", (err: any) => {
    console.error("Kafka Producer error: " + err);
    process.abort();
  });
};

export { startEventService };
