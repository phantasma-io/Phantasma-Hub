import {
	Address,
	byteArrayToHex,
	PBinaryWriter,
	PhantasmaAPI,
	PollChoice,
	ScriptBuilder,
	Transaction,
	VMType
} from 'phantasma-ts/core';
import {
	apiLink,
	FeeAmount,
	GasLimit,
	GasPrice,
	LinkWallet,
	PhantasmaAPIClient,
	TipActive,
	TipAddress
} from '$lib/store';
import type { PhantasmaLink } from 'phantasma-ts';
import {
	Base16,
	ConsensusMode,
	ConsensusPoll,
	hexStringToUint8Array,
	PBinaryReader,
	PollState,
	Serialization,
	stringToUint8Array,
	Timestamp,
	uint8ArrayToString,
	VMObject
} from 'phantasma-ts/core';
import {
	NotificationError,
	NotificationSuccess
} from '$lib/Components/Notification/NotificationsBuilder';

let Link: PhantasmaLink;
LinkWallet.subscribe((link: any) => {
	Link = link;
});

let api: PhantasmaAPI;
PhantasmaAPIClient.subscribe((client: any) => {
	api = client;
});

let gasLimit: number;
GasLimit.subscribe((limit: any) => {
	gasLimit = limit;
});

let gasPrice: number;
GasPrice.subscribe((price: any) => {
	gasPrice = price;
});

let tipActive: boolean;
TipActive.subscribe((active: boolean) => {
	tipActive = active;
});

export function shuffleArray<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
/**
 * Get Tokens details by token symbol.
 * @param symbol
 * @returns
 */
export async function GetTokenDetails(symbol: string) {
	return await api.getToken(symbol);
}

/**
 * Get transaction by Hash
 * @param txHash
 * @returns
 */
export async function GetTransactionByHash(txHash: string) {
	return await api.getTransaction(txHash);
}

/**
 * Transfer tokens from one address to another
 * @param symbol
 * @param amount
 * @param to
 * @returns
 */
export function TransferTokens(symbol: string, amount: number, to: string) {
	if (!Link.account) {
		NotificationError('Wallet Error!', 'Please connect your wallet first.');
		return;
	}

	const from = Address.FromText(String(Link.account.address));
	const payload = Base16.encode('Tools.TransferTokens');

	const toAddress = Address.FromText(to);
	const sb = new ScriptBuilder();
	sb.AllowGas(from, Address.Null, gasPrice, gasLimit);
	if (tipActive) {
		sb.CallInterop('Runtime.TransferTokens', [from, TipAddress, 'KCAL', FeeAmount]);
	}
	const myScript = sb
		.CallInterop('Runtime.TransferTokens', [from, to, symbol, amount])
		.SpendGas(from)
		.EndScript();

	Link.signTx(
		myScript,
		payload,
		async function (tx) {
			NotificationSuccess('Fetching Transaction!', 'Retriving transaction from the blockchain...');
			await new Promise((f) => setTimeout(f, 5000));
			GetTransactionByHash(tx.hash).then((result) => {
				if (result.state.includes('Halt')) {
					NotificationSuccess(
						'Transaction Success',
						'Transaction completed successfully. You can check the transaction details in the transaction history.'
					);
				} else {
					NotificationError('Transaction Error', 'Error transfering tokens.');
				}
			});
			console.log(tx);
		},
		function () {
			NotificationError('Transaction Error', 'Error transfering tokens.');
		}
	);
}

/**
 * Stake tokens
 * @param to
 * @param amount
 * @returns
 */
export function StakeTokens(to: string, amount: number) {
	if (!Link.account) {
		NotificationError('Wallet Error!', 'Please connect your wallet first.');
		return;
	}

	const from = Address.FromText(String(Link.account.address));
	const payload = Base16.encode('Tools.StakeTokens');

	const toAddress = Address.FromText(to);
	const sb = new ScriptBuilder();
	sb.AllowGas(from, Address.Null, gasPrice, gasLimit);
	if (tipActive) {
		sb.CallInterop('Runtime.TransferTokens', [from, TipAddress, 'KCAL', FeeAmount]);
	}
	const myScript = sb.CallContract('stake', 'Stake', [to, amount]).SpendGas(from).EndScript();

	Link.signTx(
		myScript,
		payload,
		async function (tx) {
			NotificationSuccess('Fetching Transaction!', 'Retriving transaction from the blockchain...');
			await new Promise((f) => setTimeout(f, 5000));
			GetTransactionByHash(tx.hash).then((result) => {
				if (result.state.includes('Halt')) {
					NotificationSuccess(
						'Staked Successfully!',
						'Tokens staked successfully. You can check the transaction details in the transaction history.'
					);
				} else {
					NotificationError('Transaction Error', 'Error staking tokens.');
				}
			});
		},
		function () {
			NotificationError('Transaction Error', 'Error staking tokens.');
		}
	);
}

/**
 * Burn tokens
 * @param symbol
 * @param amount
 * @returns
 */
export function BurnTokens(symbol: string, amount: number) {
	if (!Link.account) {
		NotificationError('Wallet Error!', 'Please connect your wallet first.');
		return;
	}

	const from = Address.FromText(String(Link.account.address));
	const payload = Base16.encode('Tools.BurnTokens');

	const sb = new ScriptBuilder();
	sb.AllowGas(from, Address.Null, gasPrice, gasLimit);
	if (tipActive) {
		sb.CallInterop('Runtime.TransferTokens', [from, TipAddress, 'KCAL', FeeAmount]);
	}
	const myScript = sb
		.CallInterop('Runtime.BurnTokens', [from, symbol, amount])
		.SpendGas(from)
		.EndScript();

	Link.signTx(
		myScript,
		payload,
		async function (tx) {
			NotificationSuccess('Fetching Transaction!', 'Retriving transaction from the blockchain...');
			await new Promise((f) => setTimeout(f, 5000));
			GetTransactionByHash(tx.hash).then((result) => {
				if (result.state.includes('Halt')) {
					NotificationSuccess(
						'Burned Successfully!',
						'Tokens burned successfully. You can check the transaction details in the transaction history.'
					);
				} else {
					NotificationError('Transaction Error', 'Error burning tokens.');
				}
			});
		},
		function () {
			NotificationError('Transaction Error', 'Error burning tokens.');
		}
	);
}

/**
 *
 * @param data
 * @returns
 */
export function DecodeInformation(data: string): VMObject {
	const bytes = Base16.decodeUint8Array(data.toUpperCase());
	const vm = new VMObject();
	const reader = new PBinaryReader(bytes);
	vm.UnserializeData(reader);
	return vm;
}

// "04534f554c044b43414c2f5333644a57614c444b596868544866323845667350366174655a35773554655a55535638774d394a4e6661443739452f53336450364c52433366337877345a5a324848394251487a594e4875485338766574624351706b4d4676526d5645460600b4f135010007221d65b56004000203000d0000b036cc325c3eb5df1633000696d2a1ca0100010006c477e55f05000100"
/**
 *
 * @param bytes
 * @param rawHex
 * @returns
 */
export function DecodeStruct(bytes: Uint8Array, rawHex: string): any {
	const result = {};
	const reader = new PBinaryReader(bytes);
	console.log(rawHex);
	if (rawHex[1] == '4') {
		console.log(reader.readString());
		rawHex = rawHex.slice(reader.position, rawHex.length);
		return DecodeStruct(bytes, rawHex);
	}

	if (rawHex[1] == '5') {
		console.log(reader.readInt());
	}
	return result;
}

/**
 *
 * @param vm
 * @returns
 */
export function FormatData(vm: VMObject): any {
	const result: any = {};
	if (vm.Data instanceof Map && vm.Data instanceof Map<VMObject, VMObject>) {
		console.log('map', vm);
		/*if (vm.Data.size == 4) {
			let index = 0;
			let _keyAddress = '';
			for (const item of vm.Data.keys()) {
				_keyAddress = item.AsString();
				index++;
				if (index == 3) break;
			}

			if (_keyAddress == 'LengthInBytes') {
				//return Address.FromBytes(Base16.decodeUint8Array(hexData.toUpperCase()));
			}
		}*/
		for (const item of vm.Data) {
			console.log(item);
			const _key = item[0].AsString();
			result[_key] = FormatData(item[1]);
		}
	} else if (vm.Data instanceof Array) {
		const arr: any[] = [];
		console.log('array', vm);

		for (const item of vm.Data) {
			console.log('array item', item);
			arr.push(FormatData(item));
		}
		return arr;
	} else if (vm.Data instanceof VMObject) {
		console.log('vm data', vm);
		return FormatData(vm.Data);
	} else {
		console.log('vm', vm);
		/*if (vm.Type == VMType.Bytes) {
			const data = DecodeInformation(vm.AsString());
			return FormatData(data);
		}*/
		return vm.AsString();
	}
	return result;
}

/*export function ChangeOwner() {
	if (!Link.account) {
		NotificationError('Wallet Error!', 'Please connect your wallet first.');
		return;
	}

	const from = Address.FromText(String(Link.account.address));
	const payload = Base16.encode('Tools.BurnTokens');

	const sb = new ScriptBuilder();
	sb.AllowGas(from, Address.Null, gasPrice, gasLimit);
	if (tipActive) {
		sb.CallInterop('Runtime.TransferTokens', [from, TipAddress, 'KCAL', FeeAmount]);
	}
	const myScript = sb
		.CallInterop('Runtime.BurnTokens', [from, symbol, amount])
		.SpendGas(from)
		.EndScript();

	Link.signTx(
		myScript,
		payload,
		function (tx) {
			console.log(tx);
		},
		function () {
			console.error('error');
		}
	);
}*/
