import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { GearSetupTypes, hasItemEquipped, resolveGearTypeSetting } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<melee|mage|range|skilling|misc> (item:...item)',
			usageDelim: ' ',
			categoryFlags: ['minion'],
			description: 'Unequips items from one of your gear setups.',
			examples: ['+unequip range Twisted bow', '+unequip melee Abyssal whip']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [gearType, itemArray]: [GearSetupTypes, Item[]]): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			return msg.send(`${msg.author.minionName} is currently out on a trip, so you can't change their gear!`);
		}

		const gearTypeSetting = resolveGearTypeSetting(gearType);
		const currentEquippedGear = msg.author.getGear(gearType);

		const itemToUnequip = itemArray.find(i => hasItemEquipped(i.id, currentEquippedGear));

		if (!itemToUnequip) {
			return msg.send("You don't have this item equipped!");
		}

		// it thinks equipment can be null somehow but hasItemEquipped already checks that
		const { slot } = itemToUnequip.equipment!;
		const equippedInThisSlot = currentEquippedGear[slot];
		const newGear = { ...currentEquippedGear };
		newGear[slot] = null;

		await msg.author.addItemsToBank({
			[equippedInThisSlot!.item]: equippedInThisSlot!.quantity
		});
		await msg.author.settings.update(gearTypeSetting, newGear);

		const image = await generateGearImage(
			this.client,
			msg.author,
			new Gear(newGear),
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);

		return msg.send(
			`You unequipped ${itemToUnequip.name} from your ${toTitleCase(gearType)} setup.`,
			new MessageAttachment(image, 'osbot.png')
		);
	}
}
