import {
	StringSelectMenuBuilder,
	ActionRowBuilder,
	type MiniComponentMessageActionRow,
	type StringSelectInteraction,
	type MiniInteractionComponent,
	InteractionReplyFlags,
} from "@minesa-org/mini-interaction";
import { getReply, listReplies } from "../../utils/db.js";

const replySelect: MiniInteractionComponent = {
	customId: "reply_select",
	handler: async (interaction: StringSelectInteraction) => {
		const name = interaction.values[0];
		const userId =
			interaction.user?.id ?? (interaction as any).member?.user?.id;
		if (!userId) {
			return interaction.reply({
				content: "Could not identify user.",
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		const reply = await getReply(name, userId);

		if (!reply) {
			return interaction.reply({
				content: `Saved reply \`${name}\` not found.`,
				flags: [InteractionReplyFlags.Ephemeral],
			});
		}

		return interaction.reply({
			content: reply.content,
		});
	},
};

export async function buildReplySelect(userId: string) {
	const replies = await listReplies(userId);

	if (replies.length === 0) {
		return null;
	}

	const select = new StringSelectMenuBuilder()
		.setCustomId("reply_select")
		.setPlaceholder("Select a saved reply to send")
		.addOptions(
			...replies.slice(0, 25).map((reply) => ({
				label: reply.name,
				value: reply.name,
				description:
					reply.content.length > 100
						? reply.content.slice(0, 97) + "..."
						: reply.content,
			})),
		);

	const row =
		new ActionRowBuilder<MiniComponentMessageActionRow>().addComponents(
			select,
		);

	return row;
}

export default replySelect;
