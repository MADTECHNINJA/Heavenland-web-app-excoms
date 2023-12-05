<template>
    <div>
        <div v-if="!collectionsFetched">
            <AppActionCard :type="AlertType.LOADING" icon="empty-set" class="mt-6">
                <template #title>Loading items...</template>
            </AppActionCard>
        </div>

        <div v-if="allCollectionsEmpty && collectionsFetched">
            <AppActionCard :type="AlertType.INFO" icon="empty-set" class="mt-6">
                <template #title>No items!</template>
                <template #desc> There's no item in any of your collections.</template>
            </AppActionCard>

            <section>
                <CollectionExploreBanner v-if="collectionsFetched" class="mt-6" title="Get your first NFT right now!" />
            </section>
        </div>
        <div
            v-else-if="collectionsFetched"
            class="flex flex-col items-center lg:items-start sm:grid sm:grid-cols-2 md:grid-cols-3 xlg:grid-cols-3 lg:grid-cols-3 xxl:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 mt-6 gap-3"
        >
            <template v-for="(collection, name) in tokenCollection" :key="collection">
                <CollectionCard
                    v-if="collection.data && collection.data.length"
                    :name="getCollectionItem(name).name"
                    :owned-items="collection.data.length"
                    :img="getCollectionImage(name)"
                    @click="$router.push('/account/collections/' + name)"
                />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { CollectionName } from '~/types/Collection.types';
    import { CollectionList } from '~/types/Collection.data';
    import { AlertType } from '~/types/Alert.utils';
    import { useAccountStore } from '~/store/account';
    import { computed } from 'vue';
    import { CollectionFactory } from '~/types/CollectionFactory.types';

    const accountStore = useAccountStore();

    const tokenCollection = computed(() => {
        return accountStore.getListingTokenCollections;
    });

    const getCollectionItem = (cn: string) => {
        return CollectionList.get(cn as CollectionName);
    };

    const allCollectionsEmpty = computed(() => {
        let empty = true;

        for (const collection in tokenCollection.value) {
            if (tokenCollection.value[collection].fetched && tokenCollection.value[collection].data?.length > 0) {
                empty = false;
            }
        }
        return empty;
    });

    const collectionsFetched = computed(() => {
        let length = 0;
        for (const collection in tokenCollection.value) {
            if (tokenCollection.value[collection].fetched) {
                length += 1;
                if (length == Object.keys(tokenCollection.value).length) {
                    return true;
                }
            }
        }

        return false;
    });

    const getCollectionImage = (collectionName: string) => {
        const cn = getCollectionItem(collectionName);

        return CollectionFactory.getCollectionCover(cn.id);
    };
</script>

<style scoped></style>
