<template>
    <nav aria-label="Progress">
        <ol
            :class="steps.steps.length > 3 && 'overflow-x-scroll md:overflow-auto'"
            role="list"
            class="flex justify-start custom-scrollbar scroll-smooth items-center md:flex-row md:space-y-0 md:space-x-3"
        >
            <li v-for="step in steps.steps" :key="step.id" class="flex items-center px-0.5 py-1 relative">
                <a class="group relative w-full tracking-tight shadow-xl px-3 md:px-6 py-2 flex flex-col">
                    <div
                        class="top-0 bottom-0 left-0 right-0 absolute w-full h-full"
                        :class="
                            step.status === 'current' &&
                            ' bg-gradient-to-r font-medium transform from-indigo-700 to-indigo-900'
                        "
                    ></div>
                    <p
                        :class="step.status === 'completed' ? 'text-gray-400' : 'text-white'"
                        class="text-xs md:text-sm font-medium z-[2]"
                    >
                        <span class="mr-0.5 whitespace-nowrap">{{ step.id }}. {{ step.title }}</span>
                    </p>
                </a>
            </li>
        </ol>
    </nav>
</template>

<script lang="ts" setup>
    import { Steps } from '~/types/Steps.types';

    defineProps<{
        steps: Steps;
    }>();
</script>

<style scoped></style>
