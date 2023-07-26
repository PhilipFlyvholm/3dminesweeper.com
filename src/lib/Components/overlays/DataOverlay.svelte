<script lang="ts">
    export let position:string = "";

</script>
<p class="badge variant-filled-primary py-1 px-2 fixed flex gap-1 {position}">
	<slot name="icon"/>
    <slot/>
</p>