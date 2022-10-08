<script lang="ts">
    export let modalOpen = false;
    export let modalTitle: string;
    export let modalTexts: string[] = [];
    export let onClose: () => void = () => {};
    export let modalName = 'my-modal';

    let modalTitleColor = 'text-white';

    // The dollar means re-run whenever referenced value (modalTitle) is changed
    // Whenever modalTitle is changed we want to change the color of it as well
    $: if (modalTitle === 'Error') {
        modalTitleColor = 'text-red-500';
    } else if (modalTitle === 'Success') {
        modalTitleColor = 'text-green-500';
    } else if (modalTitle === 'Warning') {
        modalTitleColor = 'text-yellow-500';
    } else if (modalTitle === 'Help' || modalTitle === 'Review changes') {
        modalTitleColor = 'text-accent';
    } else {
        modalTitleColor = 'text-white';
    }
</script>

<input
    type="checkbox"
    id={modalName}
    class="modal-toggle"
    aria-label="modal-toggle"
    bind:checked={modalOpen}
/>
<label
    for={modalName}
    class="modal modal-bottom md:modal-middle cursor-pointer"
    on:click|self={() => {
        onClose();
    }}
    data-test-id="modal"
>
    <label class="modal-box relative bg-primary" for="">
        <label
            for={modalName}
            class="btn btn-sm btn-circle absolute right-2 top-2"
            data-test-id="close-modal-button"
            on:click|self={() => {
                onClose();
            }}>✕</label
        >
        <h3 class="text-lg font-bold {modalTitleColor}" data-test-id="modal-title">{modalTitle}</h3>
        <ul class="py-4 list-disc pl-5" data-test-id="modal-messages-list">
            {#each modalTexts as text}
                <li class="whitespace-pre-wrap">{text}</li>
            {/each}
        </ul>
        <slot />
    </label>
</label>
