<script lang="ts">
	export let href;
	export let title;
	export let subtitle: string | undefined = undefined;
</script>

<a {href} class="px-3 py-2 text-center w-full flex items-center group" class:justify-between={$$slots.leftSide}>
	{#if $$slots.leftSide}
		<slot name="leftSide" />
	{/if}
	<div
		class="flex flex-col"
		class:text-right={$$slots.leftSide}
		class:items-center={!$$slots.leftSide}
		class:items-end={$$slots.leftSide}
	>
		<p class="vt323 h2">{title}</p>
		{#if subtitle}
			<p class="vt323 h3 subtitle">{subtitle}</p>
		{/if}
	</div>
</a>

<style>
	a {
		background: rgb(var(--color-primary-800));
		box-shadow: 0px .5rem 0px rgb(var(--color-primary-900));
        margin-bottom: .6rem;
        transition: .1s box-shadow, .1s transform;
	}

    a:hover{
        background: rgb(var(--color-primary-700));
    }
    a:active {
        box-shadow: 0px .2rem 0px rgb(var(--color-primary-900));
        background: rgb(var(--color-primary-900));
        transform: scale(.95);
    }

	.subtitle {
		color: #6e4c9c;
	}
</style>
