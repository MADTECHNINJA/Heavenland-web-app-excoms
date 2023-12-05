<template>
    <div ref="client" :class="{ connected: hasConnectedWallet }">
        <div class="z-50 bottom-3 fixed -right-[350px] w-full md:w-auto md:min-w-[350px]">
            <transition-group name="list-complete">
                <div class="list-complete-item" v-for="notification in NM.notifications" :key="notification.id">
                    <AppNotification :width="client.clientWidth" :notification="notification" />
                </div>
            </transition-group>
        </div>

        <TransitionRoot as="template" :show="sidebarOpen">
            <Dialog as="div" class="fixed inset-0 flex z-40 md:hidden" @close="sidebarOpen = false">
                <TransitionChild
                    as="template"
                    enter="transition-opacity ease-linear duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <DialogOverlay class="fixed inset-0 bg-gray-600 bg-opacity-75" />
                </TransitionChild>
                <TransitionChild
                    as="template"
                    enter="transition ease-in-out duration-300 transform"
                    enter-from="-translate-x-full"
                    enter-to="translate-x-0"
                    leave="transition ease-in-out duration-300 transform"
                    leave-from="translate-x-0"
                    leave-to="-translate-x-full"
                >
                    <div class="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-black">
                        <TransitionChild
                            as="template"
                            enter="ease-in-out duration-300"
                            enter-from="opacity-0"
                            enter-to="opacity-100"
                            leave="ease-in-out duration-300"
                            leave-from="opacity-100"
                            leave-to="opacity-0"
                        >
                            <div class="absolute top-4 right-4 pt-2.5">
                                <FontAwesomeIcon
                                    icon="times"
                                    class="ml-1 flex items-center justify-center h-5 w-5 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-950"
                                    @click="sidebarOpen = false"
                                />
                            </div>
                        </TransitionChild>
                        <div class="flex-shrink-0 flex items-center px-2">
                            <img @click="direct" class="h-8 w-auto" :src="logo" alt="excoms" />
                        </div>
                        <div class="mt-6">
                            <div class="flex flex-col px-2 md:ml-6 space-y-4">
                                <AppSpinner
                                    v-if="
                                        (!balanceStore.balanceSol.fetched || !balanceStore.balanceGenz.fetched) &&
                                        hasConnectedWallet
                                    "
                                    class="px-2 py-0.5"
                                />
                                <div>
                                    <div
                                        v-if="hasConnectedWallet && balanceStore.balanceGenz.fetched"
                                        class="flex justify-end mr-2 pt-2"
                                    >
                                        <div class="flex items-center mr-4">
                                            <img :src="excomCurrency" alt="excom" class="h-5 mr-2 rounded-full" />
                                            <span class="font-semibold text-sm">
                                                {{ balanceStore.balanceGenz.getFormattedAmount() }}
                                            </span>
                                        </div>

                                        <div
                                            v-if="hasConnectedWallet && balanceStore.balanceSol.fetched"
                                            class="flex items-center"
                                        >
                                            <img :src="solanaCurrency" alt="SOL" class="h-5 mr-1.5 rounded-full" />
                                            <span class="font-semibold text-sm">
                                                {{ balanceStore.balanceSol.getFormattedAmount() }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <HeaderConnectButton />
                            </div>
                        </div>
                        <LayoutMenu class="pt-3 mt-10 pb-5 mb-10" @update:open="sidebarOpen = false" :mobile="true" />
                    </div>
                </TransitionChild>
                <div class="flex-shrink-0 w-14" aria-hidden="true">
                    <!-- Dummy element to force sidebar to shrink to fit close icon -->
                </div>
            </Dialog>
        </TransitionRoot>

        <div class="flex flex-col">
            <div class="bg-black w-full" id="appHeader">
                <div class="mx-auto px-2 sm:px-4 md:divide-y md:divide-gray-900 md:pl-6 md:pr-8">
                    <div class="relative h-16 flex justify-between">
                        <div class="flex items-center w-full justify-between">
                            <div
                                class="md:z-10 z-30 px-2 flex md:px-0 h-10 bg-black top-0 md:top-auto md:bg-transparent md:h-8 py-3 w-screen md:w-full left-0 md:left-auto fixed"
                            >
                                <div class="flex-shrink-0 flex items-center h-fit">
                                    <FontAwesomeIcon
                                        @click="sidebarOpen = true"
                                        icon="bars"
                                        class="h-5 w-5 block md:hidden"
                                    />

                                    <img
                                        v-if="isCollapsed && !error"
                                        class="h-8 absolute mt-0.5 md:hidden md:left-0 top-1/2 md:top-0 -translate-y-1/2 md:-translate-y-0 md:translate-x-0 left-1/2 -translate-x-1/2 cursor-pointer"
                                        :src="logo"
                                        :class="{ 'xl:translate-x-5': isHidden }"
                                        @click="router.push('/')"
                                        alt="Excom"
                                    />

                                    <img
                                        v-if="isCollapsed && !error"
                                        class="h-8 absolute mt-0.5 hidden md:block md:left-0 top-1/2 md:top-0 -translate-y-1/2 md:-translate-y-0 md:translate-x-0 left-1/2 -translate-x-1/2 cursor-pointer"
                                        :src="excom"
                                        :class="{ 'xl:translate-x-5': isHidden }"
                                        @click="router.push('/')"
                                        alt="Excom"
                                    />

                                    <img
                                        v-else
                                        class="h-7 mt-1 absolute md:block md:left-0 top-0 md:translate-x-0 left-1/2 -translate-x-1/2 cursor-pointer"
                                        :src="logo"
                                        @click="router.push('/')"
                                        alt="Excoms"
                                    />
                                </div>
                            </div>

                            <div
                                class="flex justify-end w-full z-20 relative flex-col md:flex-row pt-16 md:pt-0 ease-out"
                                :class="[isCollapsed && !error ? 'md:ml-20' : 'md:ml-64']"
                            >
                                <div class="hidden items-start md:flex mt-3 md:mt-0">
                                    <!--  <HeaderMyItemsButton v-if="hasConnectedWallet" /> -->

                                    <div
                                        v-if="!balanceStore.balanceSol.fetched && hasConnectedWallet"
                                        class="py-2 ml-2 mr-4"
                                    >
                                        <AppSpinner class="px-2 pt-0.5" />
                                    </div>

                                    <div
                                        v-else-if="hasConnectedWallet"
                                        class="flex w-full justify-between md:justify-start items-center"
                                    >
                                        <div class="flex">
                                            <div
                                                class="flex border-2 ml-2 justify-center w-full px-6 border-cyan-950 py-[0.44rem] mr-2 items-center"
                                            >
                                                <img :src="solanaCurrency" alt="SOL" class="h-5 rounded-full" />
                                                <span class="ml-1 font-semibold text-sm">
                                                    {{ balanceStore.balanceSol.getFormattedAmount() }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        v-if="!balanceStore.balanceGenz.fetched && hasConnectedWallet"
                                        class="py-2 mr-4"
                                    >
                                        <AppSpinner class="px-2" />
                                    </div>

                                    <div
                                        v-else-if="hasConnectedWallet"
                                        class="flex border-2 ml-2 px-6 py-[0.44rem] w-full justify-center items-center border-cyan-950 mr-4"
                                    >
                                        <img :src="excomCurrency" alt="excom" class="h-5 mr-1 rounded-full" />
                                        <span class="ml-1 font-semibold text-sm">
                                            {{ balanceStore.balanceGenz.getFormattedAmount() }}
                                        </span>
                                    </div>

                                    <HeaderConnectButton />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="hidden md:flex md:flex-col md:fixed md:inset-y-0 ease-out"
                :class="[{ 'md:w-0': isHidden }, isCollapsed ? 'md:w-20' : 'md:w-64']"
            >
                <div class="flex-1 flex flex-col min-h-0 border-r border-color border-opacity-100" v-if="!error">
                    <div class="flex-1 flex flex-col overflow-y-auto">
                        <nav class="flex-1 py-2 pt-4 px-3 mt-16">
                            <LayoutMenu />
                        </nav>
                    </div>
                </div>
            </div>

            <div
                class="flex flex-col flex-1 ease-out"
                :class="[
                    { 'xl:pl-0': isHidden },
                    isCollapsed && !error ? 'md:pl-20' : isHidden ? 'md:pl-0' : !error ? 'md:pl-64' : '',
                ]"
            >
                <main
                    id="appMain"
                    :class="[
                        {
                            withoutBg: router.currentRoute.value.path.includes('account'),
                        },
                        router.currentRoute.value.path !== '/' &&
                            !error &&
                            'py-5 px-4  md:pt-6 sm:px-4 md:px-8 ease-out justify-center flex',
                    ]"
                >
                    <div class="text-center flex flex-col" v-if="error">
                        <div class="text-center">
                            <img class="inline-block" alt="error" :src="err404" />
                        </div>

                        <span class="text-xl my-3 text-black font-semibold">{{ error.message }}</span>
                        <div class="mt-6 fixed left-1/2 bottom-20 -translate-x-1/2">
                            <AppButton @click="router.push('/')">Back to homepage</AppButton>
                        </div>
                    </div>

                    <NuxtPage v-else @refetch="fetchInformation" />
                </main>
            </div>
        </div>
    </div>

    <div
        class="absolute -translate-x-1/2 md:translate-x-1 left-1/2 md:left-auto bottom-0 text-center md:px-0 md:right-10 py-3"
    >
        <p class="text-xs text-purple-500">
            Made by
            <a class="hyperlink" href="https://excoms.io" target="_blank">Excoms.io</a>
        </p>
    </div>
</template>

<script lang="ts" setup>
    import { onMounted, ref, watch } from 'vue';
    import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue';
    import { useWallet } from 'solana-wallets-vue';
    import { computed } from 'vue';
    import { useGlobalInfo } from '@/store/staking/global';
    import { useUserInfo } from '@/store/staking/userPool';
    import { NotificationManager } from '@/types/NotificationManager.types';

    import err404 from '@/assets/404.png';
    import logo from '@/assets/logo/logo.png';
    import excom from '@/assets/logo/excom.png';
    import { useAccountStore } from '@/store/account';
    import { useSidebarLayout } from '~/composables/useLayout';
    import { useError, useRouter } from '#app';
    import { useBalanceStore } from '~/store/balances';
    import { CollectionList } from '~/types/Collection.data';
    import { CollectionName } from '~/types/Collection.types';
    import { useCollectionStore } from '~/store/collections';

    import excomCurrency from '@/assets/currency/excom.png';
    import solanaCurrency from '@/assets/currency/solana.png';

    const sidebarOpen = ref(false);
    const { publicKey } = useWallet();
    const accountStore = useAccountStore();
    const { isCollapsed, isHidden } = useSidebarLayout();

    const client = ref(null);

    const NM = NotificationManager.getInstance();
    const error = useError();
    const router = useRouter();

    const hasConnectedWallet = computed(() => {
        return publicKey.value;
    });

    const stakingGlobalStore = useGlobalInfo();
    const stakingUserStore = useUserInfo();
    const balanceStore = useBalanceStore();
    const collectionStore = useCollectionStore();

    const fetchGlobalStakingData = async () => {
        await stakingGlobalStore.fetchGlobal();
    };

    const direct = () => {
        sidebarOpen.value = false;
        router.push('/');
    };

    const fetchBalances = () => {
        balanceStore.fetchBalances();
    };

    watch(publicKey, fetchBalances);

    const fetchInformation = async () => {
        if (publicKey.value) {
            await accountStore.fetchTokens(publicKey.value);

            await stakingUserStore.fetchUser();
        }
    };

    const fetchCollectionMetadata = async () => {
        for (const collectionId of Object.keys(collectionStore.metadata)) {
            if (
                !CollectionList.get(collectionId as CollectionName)?.isComingSoon &&
                !collectionStore.metadata[collectionId].fetched
            ) {
                // await collectionStore.fetchCollectionInfo(collectionId as CollectionName);
            }
        }
    };

    const clearInformation = () => {
        stakingUserStore.clearUser();
        accountStore.clearUser();
        balanceStore.clearUser();
    };

    watch(publicKey, () => {
        if (publicKey.value) {
            fetchInformation();
            fetchCollectionMetadata();
            fetchGlobalStakingData();
        } else {
            clearInformation();
        }
    });

    onMounted(async () => {
        fetchBalances();
        fetchCollectionMetadata();

        fetchInformation();
    });
</script>

<style scoped>
    @keyframes mobileChange {
        0% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(calc(-100% / 3));
        }
        100% {
            transform: translateY(calc(-100% / 3));
        }
    }
    .ease-out {
        transition: margin-left, padding-left, width, max-width;
        transition-duration: 0.4s;
    }

    .list-complete-item {
        transition: all 1s;
    }
    .list-complete-enter,
    .list-complete-leave-to {
        opacity: 0;
        transform: translateY(200px);
    }
    .list-complete-leave-active {
        position: absolute;
    }

    .border-color {
        border-right: 1px solid #27f5d1;
    }
</style>
