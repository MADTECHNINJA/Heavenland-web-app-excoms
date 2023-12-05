<template>
    <AppActionCard v-if="!stakedTokens?.length" :type="AlertType.INFO">
        <template #title>No active stakes</template>
        <template #desc> There are no active stakes.<br />Begin to stake by selecting one of your nfts.</template>
    </AppActionCard>

    <div v-else class="-space-y-14">
        <div
            class="flex flex-col items-center lg:items-start sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-6 gap-x-3 gap-y-9"
        >
            <div class="flex flex-col w-full" v-for="item in stakedTokens" :key="item.name">
                <component
                    :is="getItemComponent(item)"
                    :item="item"
                    :card-redirect="cardRedirect"
                    selectable
                    has-extension
                />

                <slot name="cardDetail" v-bind="{ item }" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { AlertType } from '~/types/Alert.utils';
    import { RouteLocationRaw } from 'vue-router';
    import { IStakable } from '~/types/Staking.types';
    import { IParcelBase } from '~/types/Parcel.types';
    import { StakingCard } from '#components';
    import { ActiveStaking } from '~/types/Staking.types';
    defineProps<{
        stakedTokens: ActiveStaking[];
        cardRedirect?: (item: IStakable | IParcelBase) => RouteLocationRaw;
    }>();

    const getItemComponent = (item: IStakable | ActiveStaking | IParcelBase) => {
        switch (item.cname) {
            default:
                return StakingCard;
        }
    };
</script>

<style scoped></style>
