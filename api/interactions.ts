import { MiniInteraction } from "@minesa-org/mini-interaction";
import {
	InteractionType,
	InteractionResponseType,
} from "discord-api-types/v10";
import { searchReplies } from "../src/utils/db.js";

import quickCreate from "../src/commands/quick_create.js";
import replies from "../src/commands/replies.js";
import deleteCommand from "../src/commands/delete.js";
import create from "../src/commands/create.js";
import contextQuickCreate from "../src/commands/context_quick_create.js";
import contextQuickReply from "../src/commands/context_quick_reply.js";
import createModal from "../src/components/modals/create_modal.js";
import quickReplyModal from "../src/components/modals/quick_reply_modal.js";
import replySelect from "../src/components/selectMenus/reply_select.js";

export const mini = new MiniInteraction({
	applicationId: process.env.DISCORD_APPLICATION_ID!,
	publicKey: process.env.DISCORD_APP_PUBLIC_KEY!,
	commandsDirectory: false,
	componentsDirectory: false,
});

mini.useCommands([
	quickCreate,
	replies,
	deleteCommand,
	create,
	contextQuickCreate,
	contextQuickReply,
]);

mini.useModals([createModal, quickReplyModal]);
mini.useComponent(replySelect);

export default async (req: any, res: any) => {
	if (req.method !== "POST") {
		res.statusCode = 405;
		return res.end();
	}

	const chunks: any[] = [];
	req.on("data", (chunk: any) => chunks.push(chunk));
	req.on("end", async () => {
		const body = Buffer.concat(chunks);
		const signature = req.headers["x-signature-ed25519"];
		const timestamp = req.headers["x-signature-timestamp"];

		let interaction;
		try {
			interaction = JSON.parse(body.toString());
		} catch (e) {
			res.statusCode = 400;
			return res.end();
		}

		// Handle Autocomplete
		if (
			interaction.type === InteractionType.ApplicationCommandAutocomplete
		) {
			const commandName = interaction.data.name;
			if (commandName === "replies" || commandName === "delete") {
				const focusedOption = interaction.data.options.find(
					(o: any) => o.focused,
				);
				if (focusedOption && focusedOption.name === "name") {
					const query = focusedOption.value;
					const userId =
						interaction.user?.id ?? interaction.member?.user?.id;

					const results = userId
						? await searchReplies(query, userId)
						: [];

					res.setHeader("Content-Type", "application/json");
					return res.end(
						JSON.stringify({
							type: InteractionResponseType.ApplicationCommandAutocompleteResult,
							data: {
								choices: results.map((r) => ({
									name: r.name,
									value: r.name,
								})),
							},
						}),
					);
				}
			}
		}

		// Handle other interactions via library
		try {
			const result = await mini.handleRequest({
				body,
				signature: Array.isArray(signature) ? signature[0] : signature,
				timestamp: Array.isArray(timestamp) ? timestamp[0] : timestamp,
			});

			res.statusCode = result.status;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify(result.body));
		} catch (error) {
			console.error("[Interactions] Failed to handle request:", error);
			res.statusCode = 500;
			res.end(JSON.stringify({ error: "Internal Server Error" }));
		}
	});
};
