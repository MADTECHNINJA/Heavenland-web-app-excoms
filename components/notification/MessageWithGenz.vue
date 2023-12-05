<template>
    <div>
        <div class="flex items-center">
            <span class="mr-1.5 font-normal">{{ data.amountPrefix }}</span>

            <span class="font-semibold text-gray-100">{{ data.amount }}</span>
            <img :src="excomCurrency" alt="excom" class="h-3 ml-1 rounded-full inline-block" />
        </div>
        <div v-if="data.duration" class="flex items-center pt-1">
            <span class="mr-1.5 font-normal">{{ data.durationPrefix }}</span>

            <span class="font-semibold text-gray-100"
                >{{ data.duration }} {{ data.duration > 1 ? `${data.durationSufix}s` : data.durationSufix }}</span
            >
        </div>
    </div>
</template>

<script lang="ts" setup>
    import excomCurrency from '@/assets/currency/excom.png';

    defineProps<{
        data: {
            amountPrefix: string;
            amount: number;
            duration?: number;
            durationPrefix?: string;
            durationSufix?: string;
        };
    }>();
</script>

<style scoped></style>
