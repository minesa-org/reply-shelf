import { MiniInteraction } from "@minesa-org/mini-interaction";
import dotenv from "dotenv";

process.env.DOTENV_CONFIG_QUIET = "true";
dotenv.config();

const mini = new MiniInteraction({
	applicationId: process.env.DISCORD_APPLICATION_ID!,
	publicKey: process.env.DISCORD_APP_PUBLIC_KEY!,
});

await mini.registerCommands(process.env.DISCORD_BOT_TOKEN!);
console.log("Registration complete!");
