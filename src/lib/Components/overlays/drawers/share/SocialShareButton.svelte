<script lang="ts">
	import Icon from '@iconify/svelte';

    export let icon: string;
    export let name = '';
    export let link = '';
</script>

<a href={link} target="_blank" class="btn p-0 flex flex-col justify-center items-center">
	<div class="bg-white shadow-md p-2 rounded-xl">
		<Icon icon={icon} height={56} />
	</div>
    <p class="mt-1 !mx-0">{name}</p>
</a>
