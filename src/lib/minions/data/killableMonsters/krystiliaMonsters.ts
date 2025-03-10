import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import resolveItems from '../../../util/resolveItems';
import { KillableMonster } from '../../types';

export const krystiliaMonsters: KillableMonster[] = [
	{
		id: Monsters.DesertBandit.id,
		name: Monsters.DesertBandit.name,
		aliases: Monsters.DesertBandit.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.DesertBandit,
		wildy: true,

		difficultyRating: 3,
		qpRequired: 0
	},
	{
		id: Monsters.BlackKnight.id,
		name: Monsters.BlackKnight.name,
		aliases: Monsters.BlackKnight.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.BlackKnight,
		wildy: true,

		difficultyRating: 5,
		qpRequired: 0
	},
	{
		id: Monsters.ChaosDruid.id,
		name: Monsters.ChaosDruid.name,
		aliases: Monsters.ChaosDruid.aliases,
		timeToFinish: Time.Second * 17,
		table: Monsters.ChaosDruid,

		wildy: true,

		difficultyRating: 2,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.DarkWarrior.id,
		name: Monsters.DarkWarrior.name,
		aliases: Monsters.DarkWarrior.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.DarkWarrior,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.DeadlyRedSpider.id,
		name: Monsters.DeadlyRedSpider.name,
		aliases: Monsters.DeadlyRedSpider.aliases,
		timeToFinish: Time.Second * 24,
		table: Monsters.DeadlyRedSpider,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.ElderChaosDruid.id,
		name: Monsters.ElderChaosDruid.name,
		aliases: Monsters.ElderChaosDruid.aliases,
		timeToFinish: Time.Second * 56,
		table: Monsters.ElderChaosDruid,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.Ent.id,
		name: Monsters.Ent.name,
		aliases: Monsters.Ent.aliases,
		timeToFinish: Time.Second * 37,
		table: Monsters.Ent,

		wildy: true,

		difficultyRating: 3,
		itemsRequired: resolveItems(['Dragon axe', 'Rune axe']),
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.GuardBandit.id,
		name: Monsters.GuardBandit.name,
		aliases: Monsters.GuardBandit.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.GuardBandit,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.LavaDragon.id,
		name: Monsters.LavaDragon.name,
		aliases: Monsters.LavaDragon.aliases,
		timeToFinish: Time.Second * 110,
		table: Monsters.LavaDragon,

		wildy: true,

		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0
	},
	{
		id: Monsters.MagicAxe.id,
		name: Monsters.MagicAxe.name,
		aliases: Monsters.MagicAxe.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.MagicAxe,

		wildy: true,

		difficultyRating: 3,
		// itemsRequired: resolveItems(['Lockpick']),
		qpRequired: 0,
		levelRequirements: {
			// theiving: 23
		}
	},
	{
		id: Monsters.Mammoth.id,
		name: Monsters.Mammoth.name,
		aliases: Monsters.Mammoth.aliases,
		timeToFinish: Time.Second * 38,
		table: Monsters.Mammoth,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.Pirate.id,
		name: Monsters.Pirate.name,
		aliases: Monsters.Pirate.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Pirate,

		wildy: true,

		difficultyRating: 3,
		// itemsRequired: resolveItems(['Lockpick']),
		levelRequirements: {
			// thieving: 39
		},
		qpRequired: 0
	},
	{
		id: Monsters.Rogue.id,
		name: Monsters.Rogue.name,
		aliases: Monsters.Rogue.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Rogue,

		wildy: true,

		difficultyRating: 5,
		qpRequired: 0
	}
];
