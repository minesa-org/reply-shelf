import {
	CommandContext,
	IntegrationType,
	InteractionReplyFlags,
	MessageCommandBuilder,
	type MessageContextMenuInteraction,
	type MiniInteractionCommand,
} from "@minesa-org/mini-interaction";
import { buildQuickReplyModal } from "../components/modals/quick_reply_modal.js";

const contextQuickReply: MiniInteractionCommand = {
	data: new MessageCommandBuilder()
		.setName("Quick Reply")
		.setContexts([
			CommandContext.Bot,
			CommandContext.DM,
			CommandContext.Guild,
		])
		.setIntegrationTypes([IntegrationType.UserInstall])
		.toJSON(),

	handler: async (interaction: MessageContextMenuInteraction) => {
		const userId =
			interaction.user?.id ?? (interaction as any).member?.user?.id;
		if (!userId) {
			return interaction.reply({
				content: "Could not identify user.",
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		const modal = await buildQuickReplyModal(userId);

		return interaction.showModal(modal);
	},
};

export default contextQuickReply;
