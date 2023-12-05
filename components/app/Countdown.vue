<template>
    <div class="text-xs text-purple" v-if="props.futureDate && countdown.month === 0 && countdown.year === 0">
        <span class="text-gray-300"> Remaining time:</span>
        <span class="text-purple-500 ml-2">
            {{ countdown.day }} : {{ countdown.hour }} : {{ countdown.minute }} : {{ countdown.second }}
        </span>
    </div>
</template>

<script setup lang="ts">
    import { ref, onBeforeMount, onBeforeUnmount, reactive } from 'vue';

    const props = defineProps<{
        futureDate: number;
    }>();

    const futureDate = ref(new Date(parseInt(`${props.futureDate}000`)));

    const timer = ref(null);
    const countdown = reactive({
        year: null,
        month: null,
        day: null,
        hour: null,
        minute: null,
        second: null,
    });

    const emit = defineEmits<{
        (timerDone: 'timer', payload: boolean): void;
        (e: 'reverse', reversed: boolean): void;
    }>();

    const getDateDiff = (date1: Date, date2: Date) => {
        const diff = new Date(date2.getTime() - date1.getTime());
        countdown.year = diff.getUTCFullYear() - 1970;
        countdown.month = diff.getUTCMonth();
        countdown.day = diff.getUTCDate() < 10 ? `0${diff.getUTCDate() - 1}` : diff.getUTCDate() - 1;
        countdown.hour = diff.getUTCHours() < 10 ? `0${diff.getUTCHours()}` : diff.getUTCHours();
        countdown.minute = diff.getUTCMinutes() < 10 ? `0${diff.getUTCMinutes()}` : diff.getUTCMinutes();
        countdown.second = diff.getUTCSeconds() < 10 ? `0${diff.getUTCSeconds()}` : diff.getUTCSeconds();

        if (
            Number(countdown.year) === 0 &&
            Number(countdown.month) === 0 &&
            Number(countdown.day) === 0 &&
            Number(countdown.hour) === 0 &&
            Number(countdown.minute) === 0 &&
            Number(countdown.second) == 0
        ) {
            emit('timer', true);
        }
    };

    const getDiff = () => {
        getDateDiff(new Date(), futureDate.value);
    };

    onBeforeMount(() => {
        getDiff();
        timer.value = setInterval(getDiff, 1000);
    });

    onBeforeUnmount(() => {
        clearInterval(timer.value);
    });
</script>

<style></style>
