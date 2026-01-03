import {
	CommandBuilder,
	CommandInteraction,
	CommandContext,
	IntegrationType,
	type MiniInteractionCommand,
	InteractionReplyFlags,
} from "@minesa-org/mini-interaction";
import { saveReply, countReplies } from "../utils/db.js";

const quickCreate: MiniInteractionCommand = {
	data: new CommandBuilder()
		.setName("quick-create")
		.setDescription("Quickly create a saved reply")
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
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("content")
				.setDescription("The content of the saved reply")
				.setRequired(true),
		)
		.toJSON(),

	handler: async (interaction: CommandInteraction) => {
		const name = interaction.options.getString("name", true)!;
		const content = interaction.options.getString("content", true)!;
		const userId =
			interaction.user?.id ?? (interaction as any).member?.user?.id;
		const count = await countReplies(userId!);
		if (count >= 25) {
			return interaction.reply({
				content:
					"You have reached the maximum limit of 25 saved replies.",
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		await saveReply({
			name,
			content,
			userId: userId!,
		});

		return interaction.reply({
			content: `Saved reply \`${name}\` has been created!`,
			flags: [InteractionReplyFlags.Ephemeral],
		});
	},
};

export default quickCreate;
