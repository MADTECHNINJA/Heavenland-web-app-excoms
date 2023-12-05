<template>
    <div class="space-y-12">
        <template v-for="i in 2" :key="i">
            <div>
                <div
                    class="w-[150px] h-[28px] bg-black border border-cyan-950 rounded-full animate-pulse mx-auto md:mx-0"
                ></div>
                <div
                    class="flex flex-col items-center lg:items-start sm:grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 mt-6 gap-3"
                >
                    <ParcelCardSkeleton v-for="x in 5" :key="x" />
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup></script>
