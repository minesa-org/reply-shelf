import {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	LabelBuilder,
	type ModalSubmitInteraction,
	type MiniInteractionModal,
	InteractionReplyFlags,
} from "@minesa-org/mini-interaction";
import { saveReply, countReplies } from "../../utils/db.js";

const createModal: MiniInteractionModal = {
	customId: "create_modal",
	handler: async (interaction: ModalSubmitInteraction) => {
		const name = interaction.getTextInputValue("name_input")!;
		const content = interaction.getTextInputValue("content_input")!;
		const userId =
			interaction.user?.id ?? (interaction as any).member?.user?.id;

		if (!userId) {
			return interaction.reply({
				content: "Could not identify user.",
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		const count = await countReplies(userId!);
		if (count >= 25) {
			return interaction.reply({
				content:
					"You have reached the maximum limit of 25 saved replies.",
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		try {
			await saveReply({
				name,
				content,
				userId,
			});

			return interaction.reply({
				content: `Saved reply \`${name}\` has been created!`,
				flags: [InteractionReplyFlags.Ephemeral],
			});
		} catch (error) {
			console.error("Failed to save reply:", error);
			return interaction.reply({
				content: "Failed to save reply. Please try again later.",
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}
	},
};

export function buildCreateModal(name?: string, content?: string) {
	const modal = new ModalBuilder()
		.setCustomId("create_modal")
		.setTitle("Create Saved Reply");

	const nameInput = new TextInputBuilder()
		.setCustomId("name_input")
		.setStyle(TextInputStyle.Short)
		.setPlaceholder("Enter a name for your reply")
		.setRequired(true);

	if (name) nameInput.setValue(name);

	const nameLabel = new LabelBuilder()
		.setLabel("Name")
		.setComponent(nameInput);

	const contentInput = new TextInputBuilder()
		.setCustomId("content_input")
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder("Enter the content of your reply")
		.setRequired(true);

	if (content) contentInput.setValue(content);

	const contentLabel = new LabelBuilder()
		.setLabel("Content")
		.setComponent(contentInput);

	modal.addComponents(nameLabel, contentLabel);

	return modal;
}

export default createModal;
