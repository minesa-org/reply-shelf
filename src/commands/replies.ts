import {
	CommandBuilder,
	CommandInteraction,
	CommandContext,
	IntegrationType,
	type MiniInteractionCommand,
	InteractionReplyFlags,
} from "@minesa-org/mini-interaction";
import { getReply } from "../utils/db.js";

const replies: MiniInteractionCommand = {
	data: new CommandBuilder()
		.setName("replies")
		.setDescription("Send a saved reply")
		.setContexts([
			CommandContext.Bot,
			CommandContext.DM,
			CommandContext.Guild,
		])
		.setIntegrationTypes([IntegrationType.UserInstall])
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("The name of the saved reply")
				.setRequired(true)
				.setAutocomplete(true),
		)
		.addStringOption((option) =>
			option
				.setName("ephemeral")
				.setDescription("Whether the reply should be ephemeral")
				.setRequired(false)
				.addChoice("Yes", "true")
				.addChoice("No", "false"),
		)
		.toJSON(),

	handler: async (interaction: CommandInteraction) => {
		const name = interaction.options.getString("name", true)!;
		const ephemeralStr =
			interaction.options.getString("ephemeral") ?? "false";
		const ephemeral = ephemeralStr === "true";
		const userId =
			interaction.user?.id ?? (interaction as any).member?.user?.id;
		if (!userId) {
			return interaction.reply({
				content: "Could not identify user.",
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		const reply = await getReply(name, userId!);

		if (!reply) {
			return interaction.reply({
				content: `Saved reply \`${name}\` not found.`,
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		return interaction.reply({
			content: reply.content,
			flags: ephemeral ? [InteractionReplyFlags.Ephemeral] : [],
		});
	},
};

export default replies;
