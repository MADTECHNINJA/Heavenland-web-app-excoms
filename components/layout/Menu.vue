<template>
    <nav class="flex flex-col mt-4 md:mt-0 mx-2 md:mx-0 space-y-2" aria-label="Sidebar">
        <template v-if="currentRoute.path.includes('/account') && mobile">
            <h1 class="ml-5 mb-2 text-sm">My account</h1>
            <NuxtLink
                v-for="tab in userNavigation"
                :key="tab.path"
                :to="tab.path"
                @click="$emit('update:open', false)"
                v-slot="{ route }"
            >
                <div
                    class="app-sidebar__item hover:text-gray-400 hover:border-gray-"
                    :class="{ active: computeRoute(route), 'justify-center': isCollapsed && !mobile }"
                >
                    <div class="min-w-[25px] flex justify-center">
                        {{ tab.icon }}
                        <FontAwesomeIcon :icon="['far', tab.icon]" />
                    </div>
                    <span v-if="!isCollapsed || mobile" class="mx-2 text-sm font-normal tracking-tight">
                        {{ tab.name }}
                    </span>
                    <span v-if="!isCollapsed" class="flex-grow text-right"> </span>
                </div>
            </NuxtLink>
        </template>
        <template v-if="currentRoute.path.includes('/account') && mobile">
            <h1 class="ml-5 mb-2 mt-3 text-sm">Market menu</h1>
            <NuxtLink
                v-for="tab in appNavigation"
                :key="tab.path"
                :to="tab.path"
                @click="$emit('update:open', false)"
                v-slot="{ route }"
            >
                <div
                    class="app-sidebar__item hover:text-gray-400 hover:border-gray-"
                    :class="{ active: computeRoute(route), 'justify-center': isCollapsed && !mobile }"
                >
                    <div class="min-w-[25px] flex justify-center">
                        <FontAwesomeIcon :icon="['far', tab.icon]" />
                    </div>
                    <span v-if="!isCollapsed || mobile" class="mx-2 text-sm font-normal tracking-tight">
                        {{ tab.name }}
                    </span>
                    <span v-if="!isCollapsed" class="flex-grow text-right"> </span>
                </div>
            </NuxtLink>
        </template>
        <template v-else>
            <NuxtLink
                v-for="tab in navigationItems"
                :key="tab.path"
                :to="tab.path"
                @click="$emit('update:open', false)"
                v-slot="{ route }"
            >
                <div
                    class="app-sidebar__item hover:text-gray-400 hover:border-gray-"
                    :class="{ active: computeRoute(route), 'justify-center': isCollapsed && !mobile }"
                >
                    <div class="min-w-[25px] flex justify-center">
                        <FontAwesomeIcon :icon="['far', tab.icon]" />
                    </div>
                    <span v-if="!isCollapsed || mobile" class="mx-2 text-sm font-normal tracking-tight">
                        {{ tab.name }}
                    </span>
                    <span v-if="!isCollapsed" class="flex-grow text-right"> </span>
                </div>
            </NuxtLink>
        </template>
    </nav>
</template>

<script lang="ts" setup>
    import { useRoute } from '#app';
    import { computed } from 'vue';
    import { userNavigation, appNavigation } from '@/js/navigation';
    import { useSidebarLayout } from '~/composables/useLayout';

    const currentRoute = useRoute();
    const { isCollapsed } = useSidebarLayout();

    defineProps<{
        mobile?: boolean;
    }>();

    const computeRoute = (route) => {
        if (currentRoute.path === '/' && route.path == '/') {
            return true;
        } else if (currentRoute.path === '/staking' && route.path == '/staking') {
            return true;
        } else if (currentRoute.path === '/upgrade' && route.path == '/upgrade') {
            return true;
        }
    };

    const navigationItems = computed(() => {
        return currentRoute.path.includes('/account') ? userNavigation : appNavigation;
    });
</script>

<style scoped lang="postcss">
    .app-sidebar__item {
        @apply flex items-center px-4 py-3.5  text-gray-300;
    }

    .app-sidebar__item:first-child {
        @apply mt-0;
    }

    .app-sidebar__item:last-child {
        @apply mb-0;
    }

    .app-sidebar__item.active {
        @apply text-cyan-950 border-indigo-600 border-cyan-950 border bg-opacity-80;
    }

    .app-sidebar__item.active span {
    }
</style>
