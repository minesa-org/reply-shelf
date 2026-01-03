import {
	CommandBuilder,
	CommandInteraction,
	CommandContext,
	IntegrationType,
	type MiniInteractionCommand,
	InteractionReplyFlags,
} from "@minesa-org/mini-interaction";
import { deleteReply } from "../utils/db.js";

const deleteCommand: MiniInteractionCommand = {
	data: new CommandBuilder()
		.setName("delete")
		.setDescription("Delete a saved reply")
		.setContexts([
			CommandContext.Bot,
			CommandContext.DM,
			CommandContext.Guild,
		])
		.setIntegrationTypes([IntegrationType.UserInstall])
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("The name of the saved reply to delete")
				.setRequired(true)
				.setAutocomplete(true),
		)
		.toJSON(),

	handler: async (interaction: CommandInteraction) => {
		const name = interaction.options.getString("name", true)!;
		const userId =
			interaction.user?.id ?? (interaction as any).member?.user?.id;
		if (!userId) {
			return interaction.reply({
				content: "Could not identify user.",
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		const result = await deleteReply(name, userId!);

		if (result.deletedCount === 0) {
			return interaction.reply({
				content: `Saved reply \`${name}\` not found.`,
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		return interaction.reply({
			content: `Saved reply \`${name}\` has been deleted.`,
			flags: [InteractionReplyFlags.Ephemeral],
		});
	},
};

export default deleteCommand;
