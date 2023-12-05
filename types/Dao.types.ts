type timestamp = number;

export enum DaoVoteStatus {
    ONGOING = 'ongoing',
    FINISHED = 'finished',
}

export type DaoVoteOption = {
    id: string;
    title: string;
    description: string;
    result: DaoVoteOptionResult;
    active?: boolean;
    displayId: string;
};

export type DaoVoteUserOption = {
    transactionHash: string;
    optionId: string;
};

export type DaoUserVoteValidation = {
    counted: DaoVoteUserOption;
    toBeCounted: DaoVoteUserOption;
};

export type DaoImage = {
    preview: string;
    fullSize: string;
};

export type DaoVoteOptionResult = {
    votingPowerSum: number;
    voterCount: number;
    voteStructure: Array<number>;
};

export type DaoVoteResult = {
    resultDescription: DaoVoteOption | null;
    winningOptionId?: string;
};

export type DaoVoteMetadata = {
    title: string;
    subtitle: string;
    description: string;
    question: string;
    images: DaoImage;
};

export type DaoUserVote = {
    voteId: string;
    votingPower: number;
    votes: DaoUserVoteValidation;
    currentVotingPower: number;
};

export class DaoVote {
    id: string;
    status: DaoVoteStatus;
    totalVoterCount: number;
    totalVotingPower: number;
    startsAt: timestamp;
    endsAt: timestamp;
    metadata: DaoVoteMetadata;
    options: Array<DaoVoteOption>;
    result: DaoVoteResult;

    constructor(data: any) {
        this.id = data.id;
        this.endsAt = data.endsAt;
        this.startsAt = data.startsAt;
        this.totalVoterCount = data.totalVoterCount;
        this.totalVotingPower = data.totalVotingPower;
        this.metadata = data.metadata;
        this.options = data.options;
        this.status = data.status;
        this.result = data.result;
    }

    get winningOption() {
        return this.options.find((option) => this.result.winningOptionId === option.id);
    }
}
