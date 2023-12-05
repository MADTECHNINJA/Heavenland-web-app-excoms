import { reactive } from 'vue';

const screens = {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
};

const breakpoints = reactive({ w: 0, h: 0, is: 'xs' });

const xs = (val: number) => val >= screens.xs;
const sm = (val: number) => val >= screens.sm;
const md = (val: number) => val >= screens.md;
const lg = (val: number) => val >= screens.lg;
const xl = (val: number) => val >= screens.xl;

const getBreakpoint = (w: number) => {
    if (xl(w)) return 'xl';
    else if (lg(w)) return 'lg';
    else if (md(w)) return 'md';
    else if (sm(w)) return 'sm';
    else if (xs(w)) return 'xs';
    else return 'xs';
};

const setBreakpoint = () => {
    breakpoints.w = window.innerWidth;
    breakpoints.h = window.innerHeight;
    breakpoints.is = getBreakpoint(window.innerWidth);
};

const useBreakpoint = () => {
    setBreakpoint();
    /*onMounted(() => {
        setBreakpoint();
        window.addEventListener('resize', () => {
            setBreakpoint();
        });
    });*/

    return {
        breakpoints,
        setBreakpoint,
    };
};

export default useBreakpoint;
