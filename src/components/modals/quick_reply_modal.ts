import {
	ModalBuilder,
	ModalStringSelectMenuBuilder,
	LabelBuilder,
	type ModalSubmitInteraction,
	type MiniInteractionModal,
	InteractionReplyFlags,
} from "@minesa-org/mini-interaction";
import { listReplies, getReply } from "../../utils/db.js";

const quickReplyModal: MiniInteractionModal = {
	customId: "quick_reply_modal",
	handler: async (interaction: ModalSubmitInteraction) => {
		const findValue = (id: string): string | undefined => {
			const val = interaction.getTextInputValue(id);
			if (val) return val;

			for (const row of interaction.data.components as any[]) {
				const components = row.components || [row.component];
				for (const comp of components) {
					if (comp?.custom_id === id) {
						return comp.value || (comp.values && comp.values[0]);
					}
				}
			}
			return undefined;
		};

		const replyName = findValue("quick_reply_select");
		const ephemeral = findValue("quick_reply_visibility") === "true";
		const userId =
			interaction.user?.id ?? (interaction as any).member?.user?.id;

		if (!userId || !replyName) {
			return interaction.reply({
				content: "Missing information.",
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		const replyData = await getReply(replyName, userId);

		if (!replyData) {
			return interaction.reply({
				content: "Reply not found.",
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		return interaction.reply({
			content: replyData.content,
			flags: ephemeral ? [64] : [],
		});
	},
};

export async function buildQuickReplyModal(userId: string) {
	const replies = await listReplies(userId);

	const modal = new ModalBuilder()
		.setCustomId("quick_reply_modal")
		.setTitle("Quick Reply");

	const select = new ModalStringSelectMenuBuilder()
		.setCustomId("quick_reply_select")
		.setPlaceholder("Select a saved reply")
		.addOptions(
			...replies.slice(0, 25).map((r) => ({
				label: r.name,
				value: r.name,
				description:
					r.content.length > 100
						? r.content.slice(0, 97) + "..."
						: r.content,
			})),
		);

	const visibilitySelect = new ModalStringSelectMenuBuilder()
		.setCustomId("quick_reply_visibility")
		.setPlaceholder("Selection Visibility")
		.addOptions(
			{ label: "Public", value: "false" },
			{ label: "Private (Ephemeral)", value: "true" },
		);

	modal.addComponents(
		new LabelBuilder().setLabel("Choose a reply").setComponent(select),
		new LabelBuilder()
			.setLabel("Visibility")
			.setComponent(visibilitySelect),
	);

	return modal;
}

export default quickReplyModal;
