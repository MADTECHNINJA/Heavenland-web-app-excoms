<template>
    <AppContainer>
        <div class="h-[calc(100vh-150px)] md:h-[calc(h-screen - 5rem)]">
            <div class="flex items-center flex-col absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div class="rotate w-fit mt-20 flex flex-col items-center relative border-cyan-950 border-l-2 pl-4">
                    <h1 class="text-white text-6xl md:text-7xl lg:text-9xl">WE ARE</h1>
                    <h1 class="text-6xl lg:text-9xl md:text-7xl md:text-auto text-cyan-950">Excom</h1>
                    <h1 class="text-6xl lg:text-9xl md:text-7xl md:text-auto text-pink-950">Society</h1>
                </div>
                <div class="mt-5 text-cyan-950 md:mt-7 lg:mt-10 flex-col items-center">
                    <p class="font-bold mt-2 text-center">Society that should</p>
                    <p class="font-bold text-center ml-8 lg:ml-16">have never existed</p>
                </div>
            </div>
        </div>
        <section class="relative pb-0 pt-0 md:pt-auto" id="home">
            <!--    <img class="fixed bottom-0 hidden md:block md:-mt-10 lg:-mt-24" alt="Side" src="../assets/desktop.png" /> -->
        </section>
    </AppContainer>
</template>

<script lang="ts" setup>
    import { onMounted } from 'vue';

    onMounted(async () => {
        window.scrollTo(0, 0);
    });
</script>

<style scoped>
    .rotate {
        /* Safari */
        -webkit-transform: rotate(-90deg);
        /* Firefox */
        -moz-transform: rotate(-90deg);
        /* IE */
        -ms-transform: rotate(-90deg);
        /* Opera */
        -o-transform: rotate(-90deg);
        /* Internet Explorer */
        filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3);
    }
</style>
