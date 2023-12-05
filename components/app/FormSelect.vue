<template>
    <Listbox v-model="selected" as="div">
        <div class="relative z-10">
            <ListboxButton
                :class="
                    !border
                        ? ' border-none ring-0 '
                        : 'border-gray-400 border  focus:ring-indigo-600 ring-1 focus:ring-1'
                "
                class="py-1.5 bg-[#07072f] cursor-pointer outline-none appearance-none block w-full h-full md:pl-5 sm:text-sm"
            >
                <span :class="!border && 'justify-end'" class="flex items-center">
                    <img :src="selected.img" alt="" class="flex-shrink-0 h-5 w-5 rounded-full" />
                    <span class="ml-3 pr-4 mr-4 color-white block truncate">{{ selected.name }}</span>
                </span>
                <span class="ml-3 absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                        :icon="['fas', 'arrow-down']"
                        class="flex-shrink-0 mr-1 h-3 text-white"
                        aria-hidden="true"
                    />
                </span>
            </ListboxButton>
            <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <ListboxOptions
                    class="absolute z-10 mt-2.5 w-full shadow-xl border border-white border-opacity-20 m-2 bg-[#07072f] max-h-56 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                >
                    <ListboxOption
                        as="template"
                        v-for="item in items"
                        :key="item.id"
                        :value="item"
                        v-slot="{ active, selected }"
                    >
                        <li
                            :class="[
                                active ? 'text-white bg-indigo-900 ' : 'text-white',
                                'cursor-pointer select-none relative  py-2.5 px-4',
                            ]"
                        >
                            <div class="flex items-center">
                                <img :src="item.img" alt="" class="flex-shrink-0 h-5 w-5 rounded-full" />
                                <span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-2 block truncate']">
                                    {{ item.name }}
                                </span>
                            </div>

                            <span
                                v-if="selected"
                                :class="[
                                    active ? 'text-white' : 'text-indigo-600',
                                    'absolute inset-y-0 right-0 flex items-center mr-4',
                                ]"
                            >
                            </span>
                        </li>
                    </ListboxOption>
                </ListboxOptions>
            </transition>
        </div>
    </Listbox>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue';

    const props = defineProps<{
        items: Array<{ id: number; name: string; avatar: string }>;
        border?: boolean;
    }>();

    const selected = ref(props.items[0]);
</script>
