<template>
    <button
        type="button"
        @click.prevent="onClick"
        class="transition text-purple-500 border border-purple-500 min-w-[125px] px-4 py-2 min-h-[36px] hover:brightness-125 inline-flex disabled:opacity-60 disabled:brightness-100 tracking-tight items-center justify-center py-2 text-sm font-medium focus:outline-none"
        :disabled="loading"
    >
        <template v-if="!loading">
            <FontAwesomeIcon v-if="icon" :icon="icon" class="mr-1" />
            <slot />
            <!--    <FontAwesomeIcon v-if="!icon" icon="chevron-right" class="ml-1" /> -->
        </template>
        <AppSpinner v-else />
    </button>
</template>

<script lang="ts" setup>
    const emits = defineEmits<{
        (e: 'click', p: any): void;
    }>();

    const props = defineProps<{
        icon?: string;
        loading?: boolean;
    }>();

    const onClick = (p) => {
        if (!props.loading) {
            emits('click', p);
        }
    };
</script>

<style scoped></style>
