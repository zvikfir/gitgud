import config from "config";
import kafka from "kafka-node";
import { onWebhook } from "./on_webhook";

const startEventService = async () => {
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
    if (config.has("kafka.username") && config.has("kafka.password")) {
        console.log(`Starting start_event_service service on Kafka Broker: ${config.get("kafka.username")}:${config.get("kafka.broker")}`);
    } else {
        console.log(`Starting start_event_service service on Kafka Broker: ${config.get("kafka.broker")}`);
    }
    const kafkaClient = new kafka.KafkaClient(kafkaClientConfig);
    const producer = new kafka.Producer(kafkaClient);
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
