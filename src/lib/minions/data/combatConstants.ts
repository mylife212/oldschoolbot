import { Bank } from 'oldschooljs';

import itemID from '../../util/itemID';
import { Consumable } from '../types';

// Configure boost percents
export const boostCannon = 30;
export const boostCannonMulti = 55;
export const boostIceBurst = 35;
export const boostIceBarrage = 55;
// What % of the kills should be cannon XP
export const xpPercentToCannon = 40;
export const xpPercentToCannonM = 70;
// Amount to vary cannon vs regular XP
export const xpCannonVaryPercent = 10;

export interface CombatOptionsDesc {
	id: number;
	name: string;
	desc: string;
	aliases: string[];
}
export enum CombatOptionsEnum {
	NullOption,
	AlwaysCannon,
	AlwaysIceBurst,
	AlwaysIceBarrage
}
export enum SlayerActivityConstants {
	None,
	IceBarrage,
	IceBurst,
	Cannon
}
export const CombatCannonItemBank = {
	[itemID('Cannon barrels')]: 1,
	[itemID('Cannon base')]: 1,
	[itemID('Cannon furnace')]: 1,
	[itemID('Cannon stand')]: 1
};

export const CombatOptionsArray: CombatOptionsDesc[] = [
	{
		id: CombatOptionsEnum.AlwaysCannon,
		name: 'Always Cannon',
		desc: 'Use cannon whenever possible',
		aliases: ['always cannon', 'alwayscannon', 'use cannon', 'cannon']
	},
	{
		id: CombatOptionsEnum.AlwaysIceBurst,
		name: 'Always Ice Burst',
		desc: 'Use Ice burst whenever possible',
		aliases: ['always burst', 'alwaysiceburst', 'always ice burst', 'burst', 'ice burst']
	},
	{
		id: CombatOptionsEnum.AlwaysIceBarrage,
		name: 'Always Ice Barrage',
		desc: 'Use Ice barrage whenever possible',
		aliases: ['always barrage', 'alwaysicebarrage', 'always ice barrage', 'barrage', 'ice barrage']
	}
];

export const cannonSingleConsumables: Consumable = {
	itemCost: new Bank().add('Cannonball', 1),
	qtyPerMinute: 16
};
export const cannonMultiConsumables: Consumable = {
	itemCost: new Bank().add('Cannonball', 1),
	qtyPerMinute: 60
};
// 20% less than always casting to lure.
export const iceBarrageConsumables: Consumable = {
	itemCost: new Bank().add('Water rune', 6).add('Blood rune', 2).add('Death rune', 4),
	qtyPerMinute: 16,
	isRuneCost: true
};
export const iceBurstConsumables: Consumable = {
	itemCost: new Bank().add('Water rune', 2).add('Chaos rune', 4).add('Death rune', 4),
	qtyPerMinute: 16,
	isRuneCost: true
};
