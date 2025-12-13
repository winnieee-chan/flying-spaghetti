import amqp, { Connection, Channel } from 'amqplib';
import { Candidate, JobPost } from '../types';
import { readJsonFile } from '../utils/readJson';

export class RabbitMqService {
    private static connection: amqp.Connection | null = null;
    private static channel: amqp.Channel | null = null;
    private static QUEUE_NAME = 'job_processing_queue';

    static async init() {
        try {
          const conn: any = await amqp.connect('amqp://localhost');
          this.connection = conn as amqp.Connection;
          this.channel = await conn.createChannel() as amqp.Channel;

          await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
          
          console.log('Connected to RabbitMQ');
          
          this.startConsumer();
          
        } catch (error) {
          console.error('RabbitMQ Connection Failed:', error);
          process.exit(1);
        }
    }

    static async publishJob(job: JobPost) {
        if (!this.channel) await this.init();
        
        if (!this.channel) {
            throw new Error('Channel not available');
        }
        
        const buffer = Buffer.from(JSON.stringify(job));
        
        // Send to queue
        // persistent: true tells RabbitMQ to save message to disk
        this.channel.sendToQueue(this.QUEUE_NAME, buffer, { persistent: true });
        
        console.log(`[Publisher] Sent Job to Queue: ${job.role} at ${job.companyName}`);
    }

    private static async processJobNotification(job: JobPost): Promise<void> {
        const candidates = await readJsonFile<Candidate[]>('src/data/candidates.json');

        if (!candidates) {    
            console.log('No user found');
            return;
        }

        const notificationPromises = candidates!.map(async (candidate) => {
            const isMatch = this.checkUserMatch(candidate, job);

            if (isMatch) {
                console.log(`   MATCH: Sending email to ${candidate.email}`);
                // TODO: Send email 
                // await emailService.send(...) 
            }

        });

        await Promise.all(notificationPromises);

    }

    private static startConsumer() {
        console.log('👷 Worker waiting for messages...');
    
        if (!this.channel) {
            console.error('Channel not initialized');
            return;
        }

        this.channel.consume(this.QUEUE_NAME, (msg) => {
          if (msg !== null) {
            const job: JobPost = JSON.parse(msg.content.toString());
            
            console.log(`\n[Worker] Received Job: ${job.role}. Processing matches...`);
            
            // --- BUSINES LOGIC START ---
            this.processJobNotification(job);
            // --- BUSINESS LOGIC END ---
    
            // Acknowledge message (tell RabbitMQ we are done)
            this.channel!.ack(msg);
          }
        });
    }

    private static checkUserMatch(candidate: Candidate, job: JobPost): boolean {
        // 1. If no settings, match everything
        if (!candidate.notificationSettings || candidate.notificationSettings.length === 0) {
          return true;
        }
    
        // 2. Check if ANY setting configuration matches
        return candidate.notificationSettings.some(setting => {
          const jobDesc = job.description.toLowerCase();
          const jobRole = job.role.toLowerCase();
          const jobCompany = job.companyName.toLowerCase();
    
          // Check Company
          if (setting.companyNames?.length) {
            if (!setting.companyNames.some(c => c.toLowerCase() === jobCompany)) return false;
          }
    
          // Check Role
          if (setting.jobRoles?.length) {
            if (!setting.jobRoles.some(r => r.toLowerCase() === jobRole)) return false;
          }
    
          // Check Keywords
          if (setting.keywords?.length) {
            // Must contain at least one keyword from the list
            const keywordMatch = setting.keywords.some(k => jobDesc.includes(k.toLowerCase()));
            if (!keywordMatch) return false;
          }
    
          return true;
        });
    }
}