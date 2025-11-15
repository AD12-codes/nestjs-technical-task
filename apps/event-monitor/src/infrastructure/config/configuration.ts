export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  mongodb: {
    uri:
      process.env.MONGODB_URI ||
      "mongodb://admin:password123@localhost:27017/event_monitor?authSource=admin",
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    clientId: process.env.KAFKA_CLIENT_ID || "event-monitor",
    groupId: process.env.KAFKA_GROUP_ID || "event-monitor-group",
  },
});
