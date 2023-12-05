<template>
    <div class="inline-flex items-center text-white transition ease-in-out duration-150 cursor-not-allowed">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            style="margin: auto; display: block; shape-rendering: auto"
            :class="['h-' + size, 'w-' + size, color ? color : 'text-white']"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
        >
            <circle
                cx="50"
                cy="50"
                r="32"
                stroke-width="8"
                stroke="#a855f7"
                stroke-dasharray="50.26548245743669 50.26548245743669"
                fill="none"
                stroke-linecap="round"
            >
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    repeatCount="indefinite"
                    dur="1s"
                    keyTimes="0;1"
                    values="0 50 50;360 50 50"
                ></animateTransform>
            </circle>
        </svg>
    </div>
</template>

<script lang="ts" setup>
    withDefaults(
        defineProps<{
            size?: number;
            color?: string;
        }>(),
        {
            size: 4,
        }
    );
</script>

<style scoped></style>
