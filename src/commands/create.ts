import {
	CommandBuilder,
	CommandInteraction,
	CommandContext,
	IntegrationType,
	type MiniInteractionCommand,
} from "@minesa-org/mini-interaction";
import { buildCreateModal } from "../components/modals/create_modal.js";

const create: MiniInteractionCommand = {
	data: new CommandBuilder()
		.setName("create")
		.setDescription("Create a saved reply using a modal")
		.setContexts([
			CommandContext.Bot,
			CommandContext.DM,
			CommandContext.Guild,
		])
		.setIntegrationTypes([IntegrationType.UserInstall])
		.toJSON(),

	handler: async (interaction: CommandInteraction) => {
		const modal = buildCreateModal();
		return interaction.showModal(modal);
	},
};

export default create;
