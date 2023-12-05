import { useRoute } from '#app';
import { computed } from 'vue';
import breakpoints from '@/plugins/breakpoints.client';

export const useSidebarLayout = () => {
    const route = useRoute();

    const isCollapsed = computed(() => {
        return (
            (route.path.includes('/collections') &&
                route.path !== '/collections' &&
                route.path !== '/account/collections') ||
            breakpoints().breakpoints.is !== 'xl'
        );
    });

    const isHidden = computed(() => {
        return route.path.includes('/account');
    });

    return {
        isCollapsed,
        isHidden,
    };
};
