<template>
    <div class="-space-y-14">
        <div v-if="operations?.length" class="mb-20 border border-cyan-950 w-fit px-4 py-1.5">
            <span class="text-sm font-bold"> {{ operations?.length }} </span>
            <span class="text-sm font-bold ml-1"
                >{{ operations?.length <= 1 ? 'operation is' : 'operations are' }} in progress. It may take a few
                minutes.</span
            >
        </div>
        <div
            class="flex flex-col items-center lg:items-start sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-6 gap-3"
        >
            <div class="flex flex-col w-full" v-for="item in items" :key="item.mint">
                <component
                    @value-updated="updateOperations"
                    :is="getItemComponent(item)"
                    :disabled="disabled"
                    idle
                    selectable
                    :item="item"
                    :card-redirect="cardRedirect"
                    :has-extension="true"
                />

                <slot name="cardDetail" v-bind="{ item }" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { RouteLocationRaw } from 'vue-router';
    import { IStakable } from '~/types/Staking.types';
    import { IParcelBase } from '~/types/Parcel.types';
    import { StakingCard } from '#components';

    const updateOperations = async () => {
        emit('value-updated', true);
    };

    const emit = defineEmits<{
        (event: 'value-updated', boolean): void;
    }>();

    defineProps<{
        idle?: boolean;
        operations: any;
        items: (IStakable | IParcelBase)[];
        disabled?: boolean;
        cardRedirect?: (item: IStakable) => RouteLocationRaw;
    }>();

    const getItemComponent = (item: IStakable | IParcelBase) => {
        switch (item.cname) {
            default:
                return StakingCard;
        }
    };
</script>

<style scoped></style>
