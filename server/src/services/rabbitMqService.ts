import amqp from 'amqplib';
import { Candidate, JobPost } from '../types/index.js';
import { readJsonFile } from '../utils/readJson.js';
import { CANDIDATE_FILE_PATH } from '../utils/utils.js';
import { writeJsonFile } from '../utils/writeJson.js';

/**
 * RabbitMQ-backed notification dispatcher.
 * Currently logs matches; plug in email/SMS/etc. where noted.
 */
export class RabbitMqService {
  private static connection: amqp.Connection | null = null;
  private static channel: amqp.Channel | null = null;
  private static QUEUE_NAME = 'job_processing_queue';

  static async init(): Promise<boolean> {
    try {
      const conn: amqp.Connection = await amqp.connect('amqp://localhost');
      this.connection = conn;
      this.channel = await conn.createChannel();

      await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });

      console.log('✅ Connected to RabbitMQ');

      this.startConsumer();
      return true;
    } catch (error) {
      console.warn('⚠️  RabbitMQ Connection Failed (continuing without RabbitMQ):', error instanceof Error ? error.message : error);
      console.warn('   The server will start, but job queue features will be unavailable.');
      return false;
    }
  }

  static async publishJob(job: JobPost): Promise<void> {
    if (!this.channel) {
      const connected = await this.init();
      if (!connected || !this.channel) {
        console.warn(`⚠️  Cannot publish job to queue (RabbitMQ unavailable): ${job.role} at ${job.companyName}`);
        return;
      }
    }

    const buffer = Buffer.from(JSON.stringify(job));
    this.channel.sendToQueue(this.QUEUE_NAME, buffer, { persistent: true });
    console.log(`[Publisher] Sent Job to Queue: ${job.role} at ${job.companyName}`);
  }

  private static async processJobNotification(job: JobPost) {
    try {
      const candidates = await readJsonFile<Candidate[]>(CANDIDATE_FILE_PATH);
      if (!candidates) {
        console.warn('[RabbitMqService] No candidates found when processing notifications');
        return;
      }

      const notificationPromises = candidates.map(async (candidate) => {
        const isMatch = this.checkUserMatch(candidate, job);
        if (isMatch) {
          console.log(`   MATCH: ${candidate.full_name} <${candidate.email}> for ${job.role} at ${job.companyName}`);
          
          // Send notification to candidate's mailbox
          await this.sendNotificationToMailbox(candidate, job);
        }
      });

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('[RabbitMqService] Error processing job notification:', error);
    }
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
        this.processJobNotification(job);
        this.channel!.ack(msg);
      }
    });
  }

  private static checkUserMatch(candidate: Candidate, job: JobPost): boolean {
    // If no settings, user is not subscribed
    if (!candidate.notificationSettings || candidate.notificationSettings.length === 0) {
      return false;
    }

    return candidate.notificationSettings.some((setting) => {
      const jobDesc = job.description.toLowerCase();
      const jobRole = job.role.toLowerCase();
      const jobCompany = job.companyName.toLowerCase();

      if (setting.companyNames?.length) {
        if (!setting.companyNames.some((c) => c.toLowerCase() === jobCompany)) return false;
      }

      if (setting.jobRoles?.length) {
        if (!setting.jobRoles.some((r) => r.toLowerCase() === jobRole)) return false;
      }

      if (setting.keywords?.length) {
        const keywordMatch = setting.keywords.some((k) => jobDesc.includes(k.toLowerCase()));
        if (!keywordMatch) return false;
      }

      return true;
    });
  }

  private static async sendNotificationToMailbox(candidate: Candidate, job: JobPost): Promise<void> {
    try {
      const candidates = await readJsonFile<Candidate[]>(CANDIDATE_FILE_PATH);
      if (!candidates) {
        console.warn('[RabbitMqService] Cannot send notification: candidates file not found');
        return;
      }

      const candidateIdx = candidates.findIndex(c => c._id === candidate._id);
      if (candidateIdx === -1) {
        console.warn(`[RabbitMqService] Candidate ${candidate._id} not found in file`);
        return;
      }

      // Ensure mailbox exists
      if (!candidates[candidateIdx].mailbox) {
        candidates[candidateIdx].mailbox = [];
      }

      // Create notification message
      const companyName = job.companyName.charAt(0).toUpperCase() + job.companyName.slice(1);
      const roleName = job.role.charAt(0).toUpperCase() + job.role.slice(1);
      const notificationMessage = `New job opportunity: ${roleName} at ${companyName}. ${job.description.substring(0, 200)}...`;

      const email = {
        date: Date.now(),
        sender: companyName,
        context: notificationMessage
      };

      candidates[candidateIdx].mailbox.push(email);
      await writeJsonFile(CANDIDATE_FILE_PATH, candidates);

      console.log(`   ✅ Notification sent to mailbox: ${candidate.full_name}`);
    } catch (error) {
      console.error(`[RabbitMqService] Error sending notification to ${candidate.full_name}:`, error);
    }
  }
}
