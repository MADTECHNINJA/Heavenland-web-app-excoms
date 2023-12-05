export type APIResponse<T> = {
    items: T;
    totalCount: number;
};

export type APIResponseUserVotes<T> = APIResponse<T> & {
    currentVotingPower: number;
};
