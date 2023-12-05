<template>
    <div
        aria-live="assertive"
        ref="reference"
        class="notification drop-shadow-xl z-50 inset-0 opacity-0 flex items-end px-4 md:pr-5 md:pl-0 py-1 pointer-events-none md:py-1.5 sm:items-start"
    >
        <div class="w-full relative flex flex-col items-center space-y-4 sm:items-end">
            <transition
                enter-active-class="transform ease-out duration-300 transition"
                enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div
                    v-if="show"
                    class="bg-gradient-to-r notification-scrollbar bg-black border border-cyan-950 max-w-sm w-full relative overflow-hidden max-h-[200px] pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-y-scroll"
                >
                    <div class="px-4 py-3">
                        <div class="items-start flex">
                            <div class="w-0 flex-1 pt-1">
                                <div class="flex space-x-2 items-start">
                                    <p :class="[!hidden ? '' : ' ']" class="text-sm font-medium text-purple-500">
                                        {{ notification.title }}
                                    </p>

                                    <slot v-if="$slots.link" name="link" />

                                    <NuxtLink
                                        v-else-if="notification.link"
                                        :to="notification.link.href"
                                        target="_blank"
                                        class="text-xs text-gray-200"
                                    >
                                        <img
                                            :src="solscanLogo"
                                            alt="Solscan"
                                            class="mr-1 mb-0.5 h-3 w-3 inline-block"
                                        />
                                        <span class="hyperlink"> {{ notification.link.name }}</span>
                                    </NuxtLink>
                                    <div class="flex-shrink-0">
                                        <slot v-if="$slots.icon" name="icon" />
                                        <!--  <div v-else-if="props.notification.variant === Variant.SUCCESS">
                                            <FontAwesomeIcon
                                                icon="circle-check"
                                                class="flex absolute text-purple-500 items-center justify-center h-4 w-4 pt-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-950"
                                            />
                                        </div>
                                        <div v-else-if="props.notification.variant === Variant.ERROR">
                                            <FontAwesomeIcon
                                                icon="circle-x"
                                                class="absolute text-purple-500 items-center justify-center h-3 w-3 pt-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-950"
                                            />
                                        </div> -->
                                        <div
                                            v-if="
                                                props.notification.variant !== Variant.ERROR &&
                                                props.notification.variant !== Variant.SUCCESS
                                            "
                                        >
                                            <AppSpinner class="pt-0.5 absolute" />
                                        </div>
                                        <!--   <div
                                            v-if="
                                                notification.minimizable && hidden && notification.variant === Variant.LOADING
                                            "
                                            class="flex-shrink-0 ml-0.5 flex"
                                        >
                                            <button
                                                type="button"
                                                @click="maximize()"
                                                class="absolute left-4 bottom-10 inline-flex text-white transition ease-in-out hover:text-gray-500"
                                            >
                                                <span class="sr-only">Show</span>
                                                <FontAwesomeIcon
                                                    icon="chevron-left"
                                                    class="flex fixed items-center z-50 mt-1.5 justify-center text-purple-500 h-4 w-4 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-950"
                                                />
                                            </button>
                                        </div> -->
                                    </div>
                                </div>

                                <div v-if="notification.message">
                                    <p
                                        v-if="typeof notification.message === 'string'"
                                        class="mt-2.5 mr-2.5 text-xs text-gray-200"
                                    >
                                        {{ notification.message }}
                                    </p>

                                    <div
                                        v-else-if="Array.isArray(notification.message)"
                                        :class="!hidden ? '' : 'ml-8 md:ml-6 '"
                                        class="mt-2.5 mr-2.5 text-xs text-gray-200 gap-y-1 flex flex-col"
                                    >
                                        <div v-for="(m, index) in notification.message" :key="index">
                                            <component :is="m.component" :data="m.data" />
                                        </div>
                                    </div>

                                    <div
                                        v-else
                                        :class="!hidden ? '' : 'ml-8 md:ml-6 '"
                                        class="mt-2.5 mr-2.5 text-xs text-gray-200"
                                    >
                                        <component
                                            :is="notification.message.component"
                                            :data="notification.message.data"
                                        />
                                    </div>
                                </div>

                                <p
                                    v-if="notification.variant === Variant.LOADING && notification.additionalInfo"
                                    class="mt-2.5 mr-2.5 text-xs text-cyan-950"
                                    :class="!hidden ? '' : 'ml-8 md:ml-6 '"
                                >
                                    {{ notification.additionalInfo }}
                                </p>

                                <div v-else-if="!notification.additionalInfo && !notification.message">
                                    <br />
                                </div>

                                <component
                                    class="mt-3 mr-2.5"
                                    :class="!hidden ? 'ml-2.5' : 'ml-8 md:ml-6 '"
                                    v-if="notification.transactionFlow && notification.variant !== Variant.ERROR"
                                    :is="notification.transactionFlow.component"
                                    :data="notification.transactionFlow.data"
                                />
                            </div>
                            <!--  <div
                                v-if="notification.minimizable && !hidden && notification.variant === Variant.LOADING"
                                class="flex-shrink-0 flex relative"
                            >
                                <button
                                    type="button"
                                    @click="minimize()"
                                    :class="notification.closable ? 'right-[3.25rem]' : 'right-3'"
                                    class="absolute top-[0.25rem] inline-flex text-white transition ease-in-out hover:text-gray-500"
                                >
                                    <span class="sr-only">Hide</span>
                                    <FontAwesomeIcon
                                        icon="chevron-right"
                                        class="flex fixed items-center mt-0.5 text-purple-500 justify-center h-4 w-4 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-950"
                                    />
                                </button>
                            </div> -->
                            <div v-if="notification.closable" class="flex-shrink-0 relative flex">
                                <button
                                    type="button"
                                    @click="close()"
                                    class="absolute inline-flex text-white top-[0.25rem] right-3 transition ease-in-out hover:text-gray-500"
                                >
                                    <span class="sr-only">Close</span>
                                    <FontAwesomeIcon
                                        :icon="['far', 'xmark']"
                                        class="flex items-center fixed justify-center h-5 w-5 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-950"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="reference.clientHeight >= 200"
                        class="bg-gradient-to-r sticky -bottom-1 from-indigo-800 to-indigo-930 h-5"
                    ></div>
                    <div
                        v-if="!notification.indefinite"
                        :style="bar"
                        :class="[
                            props.notification.variant === Variant.LOADING && 'bg-black',
                            props.notification.variant === Variant.SUCCESS &&
                                'bg-gradient-to-r from-purple-500 to-purple-900',
                            props.notification.variant === Variant.ERROR &&
                                'bg-gradient-to-r from-purple-500 to-purple-900',
                        ]"
                        class="bar h-2 sticky bottom-0"
                    ></div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, watch } from 'vue';
    import gsap from 'gsap';

    import solscanLogo from '@/assets/logo/solscan.png';
    import { Notification, Variant } from '~/types/Notification.types';
    import { NotificationManager } from '@/types/NotificationManager.types';

    const barWidth = ref(100);
    const bar = ref(null);
    const hidden = ref(false);
    const reference = ref(null);
    const NM = NotificationManager.getInstance();

    const props = defineProps<{
        notification: Notification;
        width: number;
    }>();

    const show = ref(false);

    const tl1 = gsap.timeline({});

    onMounted(async () => {
        open();

        tl1.from(reference.value, {
            x: 300,
            duration: 0.3,
            ease: 'linear',
            opacity: 0,
        });

        tl1.to(reference.value, {
            x: -350,
            ease: 'linear',
            opacity: 1,
        });
    });

    watch(props.notification, () => {
        if (props.notification.close === true) {
            close();
        } else {
            open();
        }
        if (!props.notification.minimizable) {
            maximize();
        }
    });

    const open = () => {
        show.value = true;
        if (props.notification.variant != Variant.LOADING) {
            if (!props.notification.indefinite) {
                setTimeout(() => {
                    const interval = setInterval(() => {
                        if (barWidth.value === 0) {
                            close();
                            barWidth.value = 100;
                            clearInterval(interval);
                        } else {
                            animate();
                        }
                    }, props.notification.duration / 100);
                }, 0);
            } else {
                bar.value = ` width:${barWidth.value}%`;
            }
        }
    };

    const close = async () => {
        await tl1.to(reference.value, {
            x: 300,
            opacity: 0,
            ease: 'linear',
            duration: 0.4,
        });

        show.value = false;
        NM.remove(props.notification.id);
    };

    const maximize = () => {
        hidden.value = false;
        tl1.to(reference.value, {
            x: -350,
            ease: 'linear',
            duration: 0.4,
        });
    };

    /* const minimize = () => {
        hidden.value = true;
        tl1.to(reference.value, {
            x: props.width <= 375 ? -35 : props.width <= 390 ? -20 : -40,

            ease: 'linear',
            duration: 0.4,
        });
    }; */

    const animate = () => {
        barWidth.value--;
        bar.value = ` width:${barWidth.value}%;
        }`;
    };
</script>

<style scoped>
    .bar {
        height: 4px;

        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        transition: width 0.04s linear;
    }

    .notification-scrollbar {
        scrollbar-width: auto;
        scrollbar-color: #001540 transparent;
    }

    /* Chrome, Edge, and Safari */
    .notification-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        scroll-margin-right: 10px;
    }

    .notification-scrollbar::-webkit-scrollbar-track {
        background: transparent;
        scroll-margin-right: 10px;
    }

    .notification-scrollbar::-webkit-scrollbar-thumb {
        border: 4px solid rgba(0, 0, 0, 0);
        border-radius: 9999px;
        background-color: rgba(255, 255, 255, 0.25);
    }

    .notification-scrollbar::-webkit-scrollbar-track-piece:end {
        background: transparent;
        margin-bottom: 5px;
    }

    .notification-scrollbar::-webkit-scrollbar-track-piece:start {
        background: transparent;
        margin-top: 5px;
    }
</style>
