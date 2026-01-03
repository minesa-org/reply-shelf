import {
	CommandBuilder,
	CommandContext,
	IntegrationType,
	InteractionReplyFlags,
	MessageCommandBuilder,
	type MessageContextMenuInteraction,
	type MiniInteractionCommand,
} from "@minesa-org/mini-interaction";
import { buildCreateModal } from "../components/modals/create_modal.js";

const contextQuickCreate: MiniInteractionCommand = {
	data: new MessageCommandBuilder()
		.setName("Quick Create")
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

		const targetId = interaction.data.target_id;
		const message = interaction.data.resolved.messages[targetId];
		const content = message.content;

		const modal = buildCreateModal("", content);
		return interaction.showModal(modal);
	},
};

export default contextQuickCreate;
