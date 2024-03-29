<script lang="ts">
	import Modal from '$lib/Components/Modals/Modal.svelte';
	import Icon from '@iconify/svelte';
	import Card from '$lib/Components/Card/Card.svelte';
	import { singleVote } from '$lib/Components/Wallet/VoteCommands';
	import { PhantasmaLink } from 'phantasma-ts';
	import {
		ConsensusMode,
		PollChoice,
		PollState,
		PollValue,
		Timestamp,
		type ConsensusPoll
	} from 'phantasma-ts/src';
	import moment from 'moment';
	import { beforeUpdate } from 'svelte';
	import { DateTimeFormat, LinkWallet, VotingSubjectVisible } from '$lib/store';
	//import { e } from 'vitest/dist/index-5aad25c1';

	/**
	 * @type {{ text: any; subject: any; description: any; options: any; votes: any; voters: any; status: any; created: any; expires: any; }}
	 */
	export let id: string;
	export let poll: ConsensusPoll;
	let isVisible: boolean = false;

	let connected = false;
	let Link: PhantasmaLink;
	LinkWallet.subscribe((link: any) => {
		Link = link;
		if (link.account) connected = true;
		else connected = false;
	});

	let startTime;
	let endTime;
	let timeNow: number = Timestamp.now / 1000;

	let choices: PollChoice[] = new Array<PollChoice>();
	let entries: PollValue[] = new Array<PollValue>();
	let selected;
	let pollStateColor: string = 'bg-red-300';

	beforeUpdate(async () => {
		initDates();
		initChoices();
		initPollState();
	});

	function initDates() {
		startTime = moment(poll.startTime.value * 1000).format(DateTimeFormat);
		endTime = moment(poll.endTime.value * 1000).format(DateTimeFormat);
	}

	function initChoices() {
		choices = new Array<PollChoice>();
		entries = new Array<PollValue>();

		entries = poll.entries;

		for (let i = 0; i < poll.entries.length; i++) {
			let choice: PollChoice = new PollChoice('');
			let entry = poll.entries[i] as unknown as string;
			//let bytes = Base16.decodeUint8Array(entry);
			//let reader = new PBinaryReader(bytes);
			//let pollValue = new PollValue();
			//pollValue.UnserializeData(reader);
			choice.value = poll.entries[i].value; // Base16.decode(uint8ArrayToStringDefault());
			choices.push(choice);
		}

		for (let entry in poll.entries) {
			/*let reader: PBinaryReader = new PBinaryReader(
				Base16.decodeUint8Array(poll.entries[entry] as unknown as string)
			);
			let pollValue: PollValue = new PollValue();
			pollValue.UnserializeData(reader);*/
			//entries.push(entry);
		}
		//VMObject.FromBytes(Base16.decodeUint8Array(poll.entries as unknown as string));

		//entries = VMObject.FromBytes(Base16.decodeUint8Array(poll.entries as unknown as string));
	}

	function vote() {
		let index = choices.findIndex((choice) => choice.value === selected);
		singleVote(poll.subject, index.toString());
	}

	function handleChoiceChange(event) {
		selected = event.target.value;
	}

	function initPollState() {
		/*console.log(
			poll.startTime.value <= timeNow,
			poll.endTime.value >= timeNow,
			poll.startTime.value,
			poll.endTime.value,
			timeNow
		);*/

		if (timeNow >= poll.startTime.value && poll.endTime.value >= timeNow) {
			poll.state = PollState.Active;
			pollStateColor = 'bg-blue-300';
			if (poll.endTime.value - timeNow <= 60 * 12) {
				pollStateColor = 'bg-yellow-300';
			}
		} else if (timeNow >= poll.endTime.value) {
			if (poll.state == PollState.Consensus) {
				pollStateColor = 'bg-green-300';
			} else {
				poll.state = PollState.Failure;
				pollStateColor = 'bg-red-300';
			}
		} else {
			pollStateColor = 'bg-blue-300';
		}
	}

	function OpenVotingView() {
		VotingSubjectVisible.set(poll.subject);
		isVisible = true;
	}

	initDates();
	initChoices();
	initPollState();

	// red -> Ended
	// green -> Consensus
	// blue -> Pending / Voting
	// yellow -> Close to end / Voting
	/*
	Poll ends in {poll.endTime.value * 1000 >= Timestamp.now
			? ` (Finish ${moment(poll.endTime.value * 1000).fromNow()})
			*/
</script>

{#if !isVisible}
	<Card
		size="xl"
		title="Voting Poll - {poll.subject}"
		description={poll.endTime.value * 1000 <= Timestamp.now
			? `Poll ended.`
			: `Poll will end in  ${moment(poll.endTime.value * 1000).fromNow()}`}
		class="{pollStateColor} "
	>
		<button class="absolute top-5 right-5" on:click={() => (isVisible = !isVisible)}>
			{#if isVisible}
				Hide
			{:else}
				Show
			{/if}
		</button>
		<div class="my-1">
			<form on:submit|preventDefault={() => null}>
				<div class="grid md:grid-cols-4 md:gap-6">
					<div class="relative z-0 w-full group">
						<input
							type="text"
							name="subject"
							id="subject"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={PollState[poll.state]}
							required
							disabled
						/>
						<label
							for="subject"
							class="peer-focus:font-medium absolute text text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Poll State</label
						>
					</div>

					<div class="relative z-0 w-full mb-6 group">
						<input
							type="text"
							name="subject"
							id="subject"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={poll.subject}
							required
							disabled
						/>
						<label
							for="subject"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Subject</label
						>
					</div>

					<div class="relative z-0 w-full mb-6 group">
						<input
							type="text"
							name="organization"
							id="organization"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={poll.organization}
							required
							disabled
						/>
						<label
							for="organization"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Organization</label
						>
					</div>

					<div class="relative z-0 w-full mb-6 group">
						<input
							type="text"
							name="mode"
							id="mode"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={ConsensusMode[poll.mode]}
							disabled
						/>

						<label
							for="mode"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>ConsensusMode</label
						>
					</div>

					<div class="relative z-0 w-full mb-6 group">
						<input
							type="datetime-local"
							name="startTime"
							id="startTime"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={startTime}
							required
							disabled
						/>
						<label
							for="startTime"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Start Time ({poll.startTime.value})</label
						>
					</div>
					<div class="relative z-0 w-full mb-6 group">
						<input
							type="datetime-local"
							name="endTime"
							id="endTime"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							required
							bind:value={endTime}
							disabled
						/>
						<label
							for="endTime"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>End Time ({poll.endTime.value})</label
						>
					</div>

					<div class="relative z-0 w-full mb-6 group">
						<input
							type="text"
							name="mode"
							id="mode"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={poll.choicesPerUser}
							disabled
						/>

						<label
							for="mode"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Choices Per User</label
						>
					</div>

					<div class="relative z-0 w-full mb-6 group">
						<input
							type="text"
							name="mode"
							id="mode"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={poll.totalVotes}
							disabled
						/>

						<label
							for="mode"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Total Votes</label
						>
					</div>
				</div>
			</form>
		</div>
	</Card>
{:else}
	<Card
		size="xl"
		title="Voting Poll - {poll.subject}"
		description="Consensus Poll details for {poll.subject}{poll.endTime.value * 1000 >=
		Timestamp.now
			? ` (Finish ${moment(poll.endTime.value * 1000).fromNow()})`
			: ''}."
		class="{pollStateColor} md:{pollStateColor}"
	>
		<button class="absolute top-5 right-5" on:click={() => (isVisible = !isVisible)}>
			{#if isVisible}
				Hide
			{:else}
				Show
			{/if}
		</button>
		<div class="my-1">
			<form on:submit|preventDefault={() => null}>
				<div class="grid md:grid-cols md:gap-6">
					<div class="relative z-0 w-full mb-6 group">
						<input
							type="text"
							name="subject"
							id="subject"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={PollState[poll.state]}
							required
							disabled
						/>
						<label
							for="subject"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Poll State</label
						>
					</div>
				</div>

				<div class="grid md:grid-cols-2 md:gap-6">
					<div class="relative z-0 w-full mb-6 group">
						<input
							type="text"
							name="subject"
							id="subject"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={poll.subject}
							required
							disabled
						/>
						<label
							for="subject"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Subject</label
						>
					</div>
					<div class="relative z-0 w-full mb-6 group">
						<input
							type="text"
							name="organization"
							id="organization"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={poll.organization}
							required
							disabled
						/>
						<label
							for="organization"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Organization</label
						>
					</div>
				</div>

				<div class="grid md:grid-cols-2 md:gap-6">
					<div class="relative z-0 w-full mb-6 group">
						<select
							name="mode"
							id="mode"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							disabled
						>
							<option value selected>No poll selected.</option>
							{#each Object.keys(ConsensusMode)
								.map((key) => ConsensusMode[key])
								.filter((value) => typeof value === 'string') as m}
								{#if poll.mode.toString() == ConsensusMode[m].toString()}
									<option value={ConsensusMode[m]} selected>{m}</option>
								{:else}
									<option value={ConsensusMode[m]}>{m}</option>
								{/if}
							{/each}
						</select>
						<label
							for="mode"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>ConsensusMode</label
						>
					</div>
					<div class="relative z-0 w-full mb-6 group">
						<input
							type="text"
							name="choicesPerUser"
							id="choicesPerUser"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							required
							bind:value={poll.choicesPerUser}
							disabled
						/>
						<label
							for="choicesPerUser"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Choices per user</label
						>
					</div>
				</div>

				<div class="grid md:grid-cols-2 md:gap-6">
					<div class="relative z-0 w-full mb-6 group">
						<input
							type="datetime-local"
							name="startTime"
							id="startTime"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							bind:value={startTime}
							required
							disabled
						/>
						<label
							for="startTime"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Start Time ({poll.startTime.value})</label
						>
					</div>
					<div class="relative z-0 w-full mb-6 group">
						<input
							type="datetime-local"
							name="endTime"
							id="endTime"
							class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							required
							bind:value={endTime}
							disabled
						/>
						<label
							for="endTime"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>End Time ({poll.endTime.value})</label
						>
					</div>
				</div>

				<div class="grid md:grid-cols md:gap-6 my-4">
					<h6>Choices</h6>
					<p class="-my-5 leading-normal text-sm">
						(Total votes {poll.totalVotes})
					</p>
					{#each choices as _, index (index)}
						<div class="min-h-6 pl-6.92 mb-0.5 block">
							<input
								type="radio"
								id="option"
								class="w-4.92 h-4.92 ease-soft -ml-6.92 rounded-1.4 checked:bg-gradient-to-tl checked:from-gray-900 checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative float-left mt-1 cursor-pointer appearance-none border border-solid border-slate-200 bg-white bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['\f00c'] checked:border-0 checked:border-transparent checked:bg-transparent checked:after:opacity-100"
								required
								name="option"
								value={choices[index].value}
								on:change={handleChoiceChange}
							/>
							<label
								for="option"
								class="mb-2 ml-1 font-normal cursor-pointer select-none text-sm text-slate-700"
							>
								{choices[index].value}
								<span class=" text-[0.7rem] peer-focus:font-medium">({entries[index].votes})</span
								></label
							>
						</div>
					{/each}
				</div>
				{#if poll.state == PollState.Active || poll.state == PollState.Inactive}
					{#if connected}
						<button
							class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none
             focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
							on:click={vote}>Vote</button
						>
					{:else}
						<h6 class="text-center">Connect to wallet to vote.</h6>
					{/if}
				{:else}
					<button
						disabled
						class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none
				focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
						>Poll Finished.</button
					>
				{/if}
			</form>
		</div>
	</Card>
{/if}
