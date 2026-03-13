import { Kafka, Partitioners } from 'kafkajs'

const kafka = new Kafka({
    clientId: 'url-shortener',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    retry: {
        initialRetryTime: 300,
        retries: 8
    }
})

const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
})

export async function connectProducer() {
    await producer.connect()
    console.log("Kafka producer connected")
}

export async function publishClickEvent(eventData) {
    try {
        await producer.send({
            topic: 'url-clicks',
            messages: [
                {
                    key: eventData.shortCode,
                    value: JSON.stringify({
                        ...eventData,
                        timestamp: new Date().toISOString()

                    })
                }
            ]
        })
    } catch (error) {
        console.error("Failed to publish click event to Kafka:", error)
    }
}

const consumer = kafka.consumer({ groupId: 'analytics-processor' })

export async function startConsumer(pool) {
    await consumer.connect()

    await consumer.subscribe({ topic: 'url-clicks', fromBeginning: false })
    console.log(`Kafka consumer listening on: url-clicks`)

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString())

            try {
                await pool.query(
                    `INSERT INTO click_events (short_code, clicked_at, referrer, user_agent) VALUES ($1, $2, $3, $4)`,
                    [
                        event.shortCode,
                        event.timestamp,
                        event.referrer || null,
                        event.userAgent || null
                    ]
                )
                await pool.query(
                    `UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1`,
                    [event.shortCode]
                )
                console.log(`Processed click event for ${event.shortCode} at ${event.timestamp}`)

            } catch (error) {
                console.error("Failed to process click event:", error)
            }
        }
    })
}