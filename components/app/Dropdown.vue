<template>
    <Menu as="div" class="relative w-full md:mt-0 text-left">
        <div class="text-left w-full flex">
            <MenuButton
                :class="[
                    'py-2 px-6 text-base font-semibold tracking-normal min-h-[40px]' && isLarge,
                    isSmall && 'text-xs',
                    orderedBy ? 'rounded-l-md' : '',
                ]"
                class="inline-flex items-center justify-start w-full md:w-fit shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-900 text-sm font-medium text-white focus:ring-indigo-500"
            >
                <slot v-if="$slots['icon-left']" name="icon-left" />
                <slot v-if="$slots['content'] && selected" name="content" v-bind="{ selected }" />
                <span v-else>{{ title }}</span>
                <slot v-if="$slots['icon-right']" name="icon-right" />
            </MenuButton>
            <div
                v-if="orderedBy"
                @click.prevent="reverseSorting"
                :class="selectedArray?.length === 0 && 'cursor-not-allowed opacity-60'"
                class="rounded-r-lg bg-indigo-940 flex items-center justify-center text-xs py-2 px-3 cursor-pointer font-semibold tracking-normal"
            >
                <FontAwesomeIcon
                    :icon="reverse ? ['fad', 'arrow-down-short-wide'] : ['fad', 'arrow-up-short-wide']"
                    class="flex-shrink-0 h-3 text-white"
                />
            </div>
        </div>

        <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
        >
            <MenuItems
                :class="selectedArray && !nftHelper ? 'md:w-[320px] w-full' : nftHelper ? 'md:w-[600px]' : 'w-full'"
                class="origin-top-left justify-center lg:justify-center items-center absolute z-[50] left-0 mt-2 shadow-lg bg-indigo-920 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none"
            >
                <div class="flex w-full justify-between flex-col md:flex-row">
                    <div class="py-1">
                        <MenuItem v-for="item in items" :key="item" v-slot="{ active }" as="div">
                            <a
                                @mouseenter="mouseOverItem = item"
                                @mouseleave="mouseOverItem = null"
                                @click.prevent.stop="handleOption(item, $event)"
                                href="#"
                                :class="[
                                    active || isSelected(item)
                                        ? 'bg-indigo-930  shadow-md  text-white'
                                        : 'text-gray-400',

                                    'group flex items-center  my-2 mx-2 px-4 py-2 text-sm',
                                    isSmall && 'text-xs',
                                ]"
                            >
                                <slot name="item" v-if="$slots['item']" v-bind="{ item }" />
                            </a>
                        </MenuItem>
                    </div>
                    <ParagonNftHelper :mouse-over-item="mouseOverItem" :selectedArray="selectedArray" />
                </div>
            </MenuItems>
        </transition>
    </Menu>
</template>

<script setup lang="ts">
    import { onMounted, ref, watch } from 'vue';
    import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';

    const emit = defineEmits<{
        (event: 'update:modelValue', payload: string): void;
        (e: 'reverse', reversed: boolean): void;
    }>();

    const reverse = ref(null);

    const reverseSorting = () => {
        if (props.selectedArray?.length > 0) {
            reverse.value = !reverse.value;
            emit('reverse', reverse.value);
        }
    };

    const mouseOverItem = ref('');

    const props = defineProps<{
        items: Array<any>;
        title?: string;
        modelValue: string;
        isLarge?: boolean;
        isSmall?: boolean;
        orderedBy?: boolean;
        selectedArray?: Array<string>;
        nftHelper?: boolean;
    }>();

    watch(props, () => {
        selected.value = props?.modelValue;
    });

    const isSelected = (item) => {
        return props.selectedArray?.find((element) => element === item);
    };

    onMounted(async () => {
        selected.value = props.modelValue;
    });

    const selected = ref('');

    const handleOption = (item, event) => {
        selected.value = item;
        mouseOverItem.value = null;
        emit('update:modelValue', item);
    };
</script>
