import cron from "node-cron";
import { generateForAllTopics } from "../services/generator";

export function startCron(schedule: string) {
  console.log(`Cron scheduled: "${schedule}"`);

  cron.schedule(schedule, async () => {
    console.log(`[${new Date().toISOString()}] Daily generation started...`);
    try {
      const result = await generateForAllTopics();
      console.log(`[${new Date().toISOString()}] Done — ${result.success} success, ${result.failed} failed`);
      if (result.errors.length > 0) {
        console.log("Errors:", result.errors);
      }
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Cron failed:`, err);
    }
  });
}
