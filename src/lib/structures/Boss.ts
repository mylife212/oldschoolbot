import { MessageAttachment, TextChannel } from 'discord.js';
import { calcPercentOfNum, calcWhatPercent, randFloat, reduceNumByPercent, sumArr } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import { calcDwwhChance } from '../../tasks/minions/minigames/kingGoldemarActivity';
import { Activity } from '../constants';
import { GearSetupTypes, GearStats } from '../gear';
import { Skills } from '../types';
import { NewBossOptions } from '../types/minions';
import { formatDuration, formatSkillRequirements, itemID, updateBankSetting } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { Gear } from './Gear';
import { Mass } from './Mass';

export type UserDenyResult = [true, string] | [false];

function teamSizeBoostPercent(size: number) {
	switch (size) {
		case 1:
			return -10;
		case 2:
			return 12;
		case 3:
			return 13;
		case 4:
			return 18;
		case 5:
			return 23;
		case 6:
			return 26;
		case 7:
			return 29;
		case 8:
			return 33;
		default:
			return 35;
	}
}

export function calcFood(solo: boolean, kc: number) {
	const items = new Bank();

	let brewsNeeded = Math.max(1, 8 - Math.max(1, Math.ceil((kc + 1) / 30)));
	if (solo) brewsNeeded++;
	const restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));

	items.add('Saradomin brew(4)', brewsNeeded);
	items.add('Super restore(4)', restoresNeeded);
	return items;
}

function calcSetupPercent(
	maxGear: Gear,
	userGear: Gear,
	heavyPenalizeStat: keyof GearStats,
	ignoreStats: (keyof GearStats)[]
) {
	const maxStats = maxGear.stats;
	const userStats = userGear.stats;
	let numKeys = 0;
	let totalPercent = 0;

	for (const [key, val] of Object.entries(maxStats) as [keyof GearStats, number][]) {
		if (val <= 0 || ignoreStats.includes(key)) continue;
		const rawPercent = Math.min(100, calcWhatPercent(userStats[key], val));
		totalPercent += rawPercent;
		numKeys++;
	}

	totalPercent /= numKeys;

	// Heavy penalize for having less than 50% in the main stat of this setup.
	if (userStats[heavyPenalizeStat] < maxStats[heavyPenalizeStat] / 2) {
		totalPercent = Math.floor(Math.max(0, totalPercent / 2));
	}

	if (isNaN(totalPercent) || totalPercent < 0 || totalPercent > 100) {
		throw new Error(`Invalid total gear percent.`);
	}

	return totalPercent;
}

interface BossOptions {
	id: number;
	baseDuration: number;
	baseFoodRequired: number;
	skillRequirements: Skills;
	itemBoosts: [string, number][];
	customDenier: (user: KlasaUser) => Promise<UserDenyResult>;
	bisGear: Gear;
	gearSetup: GearSetupTypes;
	itemCost?: (user: KlasaUser) => Promise<Bank>;
	mostImportantStat: keyof GearStats;
	food: Bank | ((user: KlasaUser) => Bank);
	settingsKeys: [string, string];
	channel: TextChannel;
	activity: Activity;
	massText: string;
	leader: KlasaUser;
	minSize: number;
}

export interface BossUser {
	user: KlasaUser;
	userPercentChange: number;
	deathChance: number;
	itemsToRemove: Bank;
	debugStr: string;
}

export class BossInstance {
	id: number;
	baseDuration: number;
	skillRequirements: Skills;
	itemBoosts: [string, number][];
	customDenier: (user: KlasaUser) => Promise<UserDenyResult>;
	bisGear: Gear;
	gearSetup: GearSetupTypes;
	itemCost?: (user: KlasaUser) => Promise<Bank>;
	mostImportantStat: keyof GearStats;
	food: Bank | ((user: KlasaUser) => Bank);
	bossUsers: BossUser[] = [];
	duration: number = -1;
	totalPercent: number = -1;
	settingsKeys: [string, string];
	client: KlasaClient;
	channel: TextChannel;
	activity: Activity;
	massText: string;
	users: KlasaUser[] | null = null;
	leader: KlasaUser;
	minSize: number;

	constructor(options: BossOptions) {
		this.baseDuration = options.baseDuration;
		this.skillRequirements = options.skillRequirements;
		this.itemBoosts = options.itemBoosts;
		this.customDenier = options.customDenier;
		this.bisGear = options.bisGear;
		this.gearSetup = options.gearSetup;
		this.itemCost = options.itemCost;
		this.mostImportantStat = options.mostImportantStat;
		this.id = options.id;
		this.food = options.food;
		this.settingsKeys = options.settingsKeys;
		this.channel = options.channel;
		this.client = this.channel.client as KlasaClient;
		this.activity = options.activity;
		this.leader = options.leader;
		this.minSize = options.minSize;
		this.massText = [
			options.massText,
			'\n',
			`**Item Boosts:** ${this.itemBoosts.map(i => `${i[0]}: ${i[1]}%`).join(', ')}`,
			`**BiS Gear:** ${this.bisGear}`,
			`**Skill Reqs:** ${formatSkillRequirements(this.skillRequirements)}`
		].join('\n');
	}

	async validateTeam() {
		for (const user of this.users!) {
			const [denied, reason] = await this.checkUser(user);
			if (denied) {
				throw new Error(`${user} ${reason}`);
			}
		}
	}

	async init() {
		const mass = new Mass({
			channel: this.channel,
			maxSize: 20,
			minSize: this.minSize,
			leader: this.leader,
			text: this.massText,
			ironmenAllowed: true,
			customDenier: async (user: KlasaUser) => {
				const result = await this.checkUser(user);
				return result;
			}
		});
		this.users = await mass.init();
		await this.validateTeam();
		const { bossUsers, duration, totalPercent } = await this.calculateBossUsers();
		this.bossUsers = bossUsers;
		this.duration = duration;
		this.totalPercent = totalPercent;
	}

	async checkUser(user: KlasaUser): Promise<UserDenyResult> {
		const [denied, reason] = await this.customDenier(user);
		if (denied) {
			return [true, reason!];
		}
		if (!user.hasMinion) {
			return [true, "doesn't have a minion"];
		}
		if (user.minionIsBusy) {
			return [true, 'minion is busy'];
		}
		if (!user.hasSkillReqs(this.skillRequirements)[0]) {
			return [true, "doesn't meet skill requirements"];
		}
		const itemCost = await this.calcFoodForUser(user, false);
		if (!user.owns(itemCost)) {
			return [true, `doesn't have ${itemCost}`];
		}

		const gearPercent = calcSetupPercent(
			this.bisGear,
			user.getGear(this.gearSetup),
			this.mostImportantStat,
			[]
		);
		if (gearPercent < 20) {
			return [true, `has terrible gear`];
		}

		return [false];
	}

	async calcFoodForUser(user: KlasaUser, solo = false) {
		const kc = user.getKC(this.id);
		const itemsToRemove = calcFood(solo, kc);
		const itemCost = this.itemCost && (await this.itemCost(user));
		if (itemCost) itemsToRemove.add(itemCost);
		return itemsToRemove;
	}

	async calculateBossUsers() {
		const speedReductionForGear = 25;
		const speedReductionForKC = 35;
		let speedReductionForBoosts = sumArr(this.itemBoosts.map(i => i[1]));
		const totalSpeedReduction =
			speedReductionForGear + speedReductionForKC + speedReductionForBoosts;
		const kcCap = 250;

		const bossUsers: BossUser[] = [];
		let totalPercent = 0;

		for (const user of this.users!) {
			const gear = user.getGear(this.gearSetup);
			let debugStr = [];
			let userPercentChange = 0;

			// Gear
			const gearPercent = calcSetupPercent(this.bisGear, gear, this.mostImportantStat, []);
			const gearBoostPercent = calcPercentOfNum(gearPercent, speedReductionForGear);
			userPercentChange += gearBoostPercent;
			debugStr.push(`**Gear**[${gearPercent.toFixed(1)}%]`);

			// KC
			const kc = user.getKC(this.id);
			const kcPercent = Math.min(100, calcWhatPercent(kc, kcCap));
			const kcBoostPercent = calcPercentOfNum(kcPercent, speedReductionForKC);
			userPercentChange += kcBoostPercent;
			debugStr.push(`**KC**[${kcPercent.toFixed(1)}%]`);

			// Item boosts
			let itemBoosts = 0;
			for (const [name, amount] of this.itemBoosts) {
				const allItems = gear.allItems(false);
				if (allItems.includes(itemID(name))) {
					itemBoosts += amount;
				}
			}
			const itemBoostPercent = calcWhatPercent(itemBoosts, speedReductionForBoosts);
			const itemBoostsBoostPercent = calcPercentOfNum(
				itemBoostPercent,
				speedReductionForBoosts
			);
			userPercentChange += itemBoostsBoostPercent;
			debugStr.push(`**Boosts**[${itemBoostPercent.toFixed(1)}%]`);

			// Items to remove
			const itemsToRemove = await this.calcFoodForUser(user, this.users!.length === 1);
			debugStr.push(`**Cost**[${itemsToRemove}]`);

			// Total
			debugStr.push(
				`**Total**[${calcWhatPercent(userPercentChange, totalSpeedReduction).toFixed(2)}%]`
			);

			// Death chance
			let deathChance =
				Math.max(0, reduceNumByPercent(55, kcBoostPercent * 2.4 + gearBoostPercent)) +
				randFloat(4.5, 5.5);
			debugStr.push(`**Death**[${deathChance.toFixed(2)}%]`);

			const percentToAdd = userPercentChange / this.users!.length;
			totalPercent += percentToAdd;
			debugStr.push(`-${formatDuration(calcPercentOfNum(percentToAdd, this.baseDuration))}`);

			bossUsers.push({
				user,
				userPercentChange,
				itemsToRemove,
				debugStr: debugStr.join(' '),
				deathChance
			});
		}

		let duration = this.baseDuration;
		duration = reduceNumByPercent(duration, totalPercent);

		// Reduce or increase the duration based on the team size. Solo is longer, big team is faster.
		duration -= duration * (teamSizeBoostPercent(this.users!.length) / 100);

		return {
			bossUsers,
			duration,
			totalPercent
		};
	}

	async start() {
		await this.init();
		await this.validateTeam();
		const totalCost = new Bank();
		for (const { user, itemsToRemove } of this.bossUsers) {
			await user.removeItemsFromBank(itemsToRemove);
			totalCost.add(itemsToRemove);
		}
		updateBankSetting(this.client, this.settingsKeys[0], totalCost);

		await addSubTaskToActivityTask<NewBossOptions>(this.client, {
			userID: this.users![0].id,
			channelID: this.channel.id,
			quantity: 1,
			duration: this.duration,
			type: this.activity,
			users: this.users!.map(u => u.id),
			bossUsers: this.bossUsers.map(u => ({ ...u, user: u.user.id }))
		});
		return {
			bossUsers: this.bossUsers
		};
	}

	async simulate() {
		const arr = Array(15).fill(this.leader);
		const normalTable = table([
			[
				'Team Size',
				'%',
				'Duration',
				'Death Chance',
				'DWWH Hours(hrs until team gets a dwwh)'
			],
			...(await Promise.all(
				[1, 2, 3, 4, 5, 6, 7, 8, 9, 15].map(async i => {
					let ar = arr.slice(0, i);
					this.users = ar;
					const { bossUsers, duration } = await this.calculateBossUsers();
					const dwwhChance = calcDwwhChance(bossUsers.length);
					return [
						bossUsers.length,
						bossUsers[0].userPercentChange.toFixed(1),
						formatDuration(duration),
						bossUsers[0].deathChance.toFixed(1),
						formatDuration(dwwhChance * duration)
					];
				})
			))
		]);
		return new MessageAttachment(Buffer.from(normalTable), `boss-sim.txt`);
	}
}
