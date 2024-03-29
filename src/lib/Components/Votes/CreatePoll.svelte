<script lang="ts">
	import Modal from '$lib/Components/Modals/Modal.svelte';
	import Icon from '@iconify/svelte';
	import Card from '$lib/Components/Card/Card.svelte';
	import { initPoll } from '$lib/Components/Wallet/VoteCommands';
	import { slide } from 'svelte/transition';
	import PollDetails from './PollDetails.svelte';
	import { PhantasmaLink } from 'phantasma-ts';
	import moment from 'moment';
	import {
		Address,
		byteArrayToHex,
		ConsensusMode,
		PBinaryWriter,
		PhantasmaAPI,
		PollChoice,
		Timestamp,
		type Organization
	} from 'phantasma-ts/src';
	import { DateTimeFormat, LinkWallet, PhantasmaAPIClient } from '$lib/store';

	let connected = false;
	let Link: PhantasmaLink;
	LinkWallet.subscribe((link: any) => {
		Link = link;
		if (link.account) connected = true;
		else connected = false;
	});

	let api: PhantasmaAPI;
	PhantasmaAPIClient.subscribe((value) => {
		api = value;
	});

	let subject = '';
	let organization: Organization;
	let mode: ConsensusMode;
	let choices: PollChoice[] = [];
	let numberOfChoices = 2;
	let startTime: Date = new Date(Date.now());
	let startTimeStr: string = '';
	let endTime: Date = new Date(Date.now());
	let endTimeStr: string = '';
	let choicesPerUser: BigInt = BigInt(1);
	let isPollCreated = false;

	export let organizations: Organization[] = [];

	function createPoll() {
		validateSubject();
		initPoll(
			subject,
			organization.name,
			mode,
			Timestamp.fromDate(new Date(startTimeStr)),
			Timestamp.fromDate(new Date(endTimeStr)),
			choices,
			choicesPerUser.toString()
		);

		isPollCreated = true;
	}

	function addChoice() {
		numberOfChoices++;
		validateSubject();
	}

	function validateSubject() {
		subject = subject.replace(/[^a-zA-Z0-9 _?!.,]/g, '');
		subject = subject.trimStart();
		subject = subject.trimEnd();
	}

	function handleStartTimeChange() {
		let startDate = new Date(startTimeStr);
		let formattedDate = moment(startDate.getTime() + 1000 * 60 * 60 * 24 * 7).format(
			DateTimeFormat
		);

		endTimeStr = formattedDate;
		validateSubject();
	}

	function initDates() {
		//startTime = moment(startTime.getTime()).format('yyyy-MM-DDThh:mm');
		startTime = new Date(Date.now() + 1000 * 60 * 5);
		startTimeStr = moment(startTime.getTime()).format(DateTimeFormat);
		let startDate = new Date(startTimeStr);
		//endTime = moment(startDate.getTime() + 1000 * 60 * 60 * 24).format('yyyy-MM-DDThh:mm');
		endTimeStr = moment(startDate.getTime() + 1000 * 60 * 60 * 24 * 7).format(DateTimeFormat);
	}

	function onSubjectChange() {
		// On don't remove _, ? and ! from the subject and allow upper and lower case letters and numbers and . and ,
		subject = subject.replace(/[^a-zA-Z0-9 _?!.,]/g, '');
		subject = subject.trimStart();
	}

	initDates();
</script>

<Card
	size="xl"
	title="Create Consensus Poll"
	description="Create a consensus poll for the people to vote."
	class="transition duration-150 ease-in mb-20"
>
	<div class="my-1">
		<form on:submit|preventDefault={() => null}>
			<div class="grid md:grid-cols-2 md:gap-6">
				<div class="relative z-0 w-full mb-6 group">
					<input
						type="text"
						name="subject"
						id="subject"
						bind:value={subject}
						on:change={onSubjectChange}
						on:keydown={onSubjectChange}
						on:keypress={onSubjectChange}
						class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-solid border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
						placeholder=" "
						required
					/>
					<label
						for="subject"
						class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
						>Subject</label
					>
				</div>
				<div class="relative z-0 w-full mb-6 group">
					<select
						name="organization"
						id="organization"
						bind:value={organization}
						class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-solid border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
					>
						<option value selected>No organization selected.</option>
						{#each organizations as org}
							<option value={org}>
								{org.name}
							</option>
						{/each}
					</select>
					<!---<input
						type="text"
						name="organization"
						id="organization"
						bind:value={organization}
						class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-solid border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
						placeholder=" "
						required
					/>-->
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
						bind:value={mode}
						class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-solid border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
					>
						<option value selected>No poll selected.</option>
						{#each Object.keys(ConsensusMode)
							.map((key) => ConsensusMode[key])
							.filter((value) => typeof value === 'string') as m}
							<option value={ConsensusMode[m]}>
								{m}
							</option>
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
						bind:value={choicesPerUser}
						class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-solid border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
						placeholder=" "
						required
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
						bind:value={startTimeStr}
						on:change={handleStartTimeChange}
						class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-solid border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
						placeholder=" "
						min={Date.now()}
						required
					/>
					<label
						for="startTime"
						class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
						>Start Time</label
					>
				</div>
				<div class="relative z-0 w-full mb-6 group">
					<input
						type="datetime-local"
						name="endTime"
						id="endTime"
						bind:value={endTimeStr}
						class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent
                     border-b-2 border-solid
                     border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
						placeholder=" "
						min={Date.now()}
						required
					/>
					<label
						for="endTime"
						class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
						>End Time</label
					>
				</div>
			</div>

			<hr class="my-6" />

			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Choices</h3>
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Add choices for your poll.</p>
				<button
					on:click={addChoice}
					class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none
                    focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				>
					Add more choices
				</button>
			</div>

			<div class="grid md:grid-cols md:gap-6 my-4">
				{#each Array(numberOfChoices) as _, index (index)}
					<div class="relative z-0 w-full mb-6 group">
						<input
							type="text"
							id="option-{index}"
							bind:value={choices[index]}
							class="block py-2.5 px-0 w-full text-sm
                     border-b-2 border-solid
                     text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
							placeholder=" "
							required
						/>
						<label
							for="option-{index}"
							class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100
                    peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
							>Option - {index}</label
						>
					</div>
				{/each}
			</div>

			<hr class="my-6" />

			{#if connected}
				<button
					on:click={createPoll}
					class="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none
             focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
					>Create</button
				>
			{:else}
				<h6 class="text-center">Connect to Wallet.</h6>
			{/if}
		</form>
	</div>
</Card>
