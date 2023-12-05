<template>
    <div
        id="solanaStatusDiv"
        class="lg:bg-indigo-930 w-full md:w-auto justify-center lg:justify-start px-3 h-[36px] items-center text-gray-300-600 text-xs font-semibold lg:flex flex"
    >
        <AppAlert v-if="tps.error">Error</AppAlert>

        <AppSpinner v-else-if="!tps.fetched" />

        <div v-else class="flex items-center">
            <img :src="solanaLogoWhite" class="h-3 pr-3" alt="Solana status" draggable="false" />
            <div
                class="flex items-center"
                :class="{
                    'text-red-500': formatting.formatNumberToDecimal(tps.data) < 500,
                    'text-yellow-500 ': formatting.formatNumberToDecimal(tps.data) >= 500,
                }"
            >
                <FontAwesomeIcon
                    v-if="formatting.formatNumberToDecimal(tps.data) < 1000"
                    :icon="['far', 'circle-exclamation']"
                    class="mr-1"
                />
                <FontAwesomeIcon v-else :icon="['far', 'circle-check']" class="text-green-500 mr-1" />
                <span>{{ formatting.formatNumberToDecimal(tps.data) }} TPS</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import solanaLogoWhite from '@/assets/logo/solana-white.png';
    import { onMounted, ref } from 'vue';
    import { Metaplex } from '~/js/metaplex';
    import { DataWrapper } from '~/types/DataWrapper.types';
    import * as formatting from '@/js/formatting';

    const tps = ref(new DataWrapper<number>());

    onMounted(async () => {
        await reloadTPS();

        setInterval(await reloadTPS, 30000);
    });

    const reloadTPS = async () => {
        const _tps = await Metaplex.getInstance().getTPS();

        if (_tps !== null) {
            tps.value.setData(_tps);
        }
    };
</script>

<style scoped></style>
