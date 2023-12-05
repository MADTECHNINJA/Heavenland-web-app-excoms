<template>
    <div
        class="bg-black border border-b-transparent border-cyan-950 relative w-full shadow not:disabled:cursor-pointer transition-all"
        :class="[{ [selectableProps]: selectable && !disabled }, { 'opacity-50 cursor-auto': disabled }]"
        @click="redirectToDetail"
    >
        <div class="px-3 py-5 flex flex-col items-center">
            <h2 class="text-sm leading-6 font-semibold text-gray-100">
                <span v-if="item.attributes">{{ item.cluster + item.subzone + ' #' + item.id }}</span>
                <span v-else>{{ item.name }}</span>
            </h2>
            <div v-if="item.coordinates" class="text-sm flex items-center text-purple-500 font-medium mt-1 space-x-3">
                <span>Excoms</span>
            </div>
        </div>
        <div class="relative">
            <div
                class="aspect-square bg-black overflow-hidden border-b border-cyan-950"
                :class="{ 'animate-pulse': item.image && !loaded }"
            >
                <img
                    v-if="item.image"
                    v-lazy="{ src: lazyOptions.src, lifecycle: lazyOptions.lifecycle }"
                    :class="{ 'opacity-0': !loaded }"
                    :alt="item.name"
                />

                <div v-else>
                    <FontAwesomeIcon
                        icon="image-slash"
                        class="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
                    />
                </div>
            </div>

            <img
                v-if="(!item.image || loaded) && isFrozenImage"
                :src="getFrozenImage"
                alt="Frozen NFT"
                class="absolute border-b border-cyan-950 top-0 left-0"
                :class="[!item.image ? 'opacity-25' : 'opacity-50']"
            />

            <div
                v-if="
                    (item.drillThroughAmount || item.highTrafficAmount) &&
                    (item.isParcelBucket || item.drillThroughAmount > 0 || item.highTrafficAmount > 0)
                "
                class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs drop-shadow-md items-center justify-center"
            >
                <!--  <AppTooltip>
                    <template #text>
                        <div class="flex flex-col space-y-2 min-w-[120px]">
                            <div v-if="item.isParcelBucket" class="flex items-center space-x-1.5">
                                <FontAwesomeIcon icon="layer-group" class="text-white" />
                                <span class="whitespace-nowrap">{{ getParcelsCount }}x Parcels</span>
                            </div>

                            <div v-if="item.drillThroughAmount > 0" class="flex items-center space-x-1.5">
                                <FontAwesomeIcon :icon="['far', 'star']" class="text-amber-600" />
                                <span class="whitespace-nowrap">{{ item.drillThroughAmount }}x Drill through</span>
                            </div>

                            <div v-if="item.highTrafficAmount > 0" class="flex items-center space-x-1.5">
                                <img :src="highTrafficIcon" class="h-[11px] w-[16px]" alt="High traffic" />
                                <span class="whitespace-nowrap">{{ item.highTrafficAmount }}x High traffic</span>
                            </div>
                        </div>
                    </template>

                    <div class="flex items-center bg-black px-3 py-1 space-x-2 min-h-[24px]">
                        <div v-if="item.isParcelBucket" class="flex items-center">
                            <span class="font-bold mr-1">{{ getParcelsCount }}</span>
                            <FontAwesomeIcon icon="layer-group" class="text-white" />
                        </div>
                        <div v-if="item.drillThroughAmount > 0" class="flex items-center">
                            <span v-if="item.drillThroughAmount > 1" class="font-bold mr-1">
                                {{ item.drillThroughAmount }}
                            </span>

                            <FontAwesomeIcon :icon="['far', 'star']" class="text-amber-600" />
                        </div>
                        <div v-if="item.highTrafficAmount > 0" class="flex items-center">
                            <span v-if="item.highTrafficAmount > 1" class="font-bold mr-1">
                                {{ item.highTrafficAmount }}
                            </span>

                            <img :src="highTrafficIcon" class="h-[14px]" />
                        </div>
                    </div>
                </AppTooltip> -->
            </div>
        </div>

        <slot />
    </div>
</template>

<script lang="ts" setup>
    import { RouteLocationRaw, useRouter } from 'vue-router';
    import type { IParcelBase } from '~/types/Parcel.types';
    import { computed, reactive, ref } from 'vue';
    import frozenTypeA from 'assets/staking/frozen-type-a.png';
    import { mapState } from 'pinia';
    import { useUserInfo } from '~/store/staking/userPool';

    const router = useRouter();

    const props = defineProps<{
        item: IParcelBase;
        selectable?: boolean;
        bottomRounded?: boolean;
        disabled?: boolean;
        hasExtension: boolean;
        cardRedirect?: (item: IParcelBase) => RouteLocationRaw;
    }>();

    const stakedTokens = computed(() => {
        return mapState(useUserInfo, {
            fetched: (store) => store.stakedTokens.fetched,
            error: (store) => store.stakedTokens.error,
            data: (store) => store.stakedTokens.data,
        });
    });

    const isFrozenImage = computed(() => {
        return stakedTokens.value.data()?.find((p) => p.mint === props.item.mint);
    });

    const selectableProps = ' hover:shadow-lg cursor-pointer transition-shadow';

    const getFrozenImage = computed(() => {
        switch (props.item.cname) {
            default:
                return frozenTypeA;
        }
    });

    const redirectToDetail = () => {
        if (props.selectable && props.cardRedirect && !props.disabled) {
            router.push(props.cardRedirect(props.item));
        }
    };

    const loaded = ref(false);

    const lazyOptions = reactive({
        src: props.item.image,
        lifecycle: {
            loading: () => {
                loaded.value = false;
            },
            loaded: () => {
                loaded.value = true;
            },
        },
    });
</script>

<style scoped></style>
