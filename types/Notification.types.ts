import { NotificationParams } from '@/types/NotificationManager.types';
import { getTxSolscanUrl } from '~/js/url';
import { formatNumberToDecimal } from '~/js/formatting';
import * as web3 from '@solana/web3.js';

export type Link = {
    name: string;
    href: string;
};

export enum Variant {
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error',
}

export class Notification {
    readonly duration = 4000;
    close = false;
    title: string;
    id: number;
    variant: Variant;
    closable: boolean;
    hidden: boolean;
    minimizable: boolean;
    indefinite: boolean;
    link: Link;
    additionalInfo?: string;
    message?:
        | string
        | {
              component: unknown;
              data: unknown;
          }
        | {
              component: unknown;
              data: unknown;
          }[];
    transactionFlow?: {
        component: unknown;
        data: unknown;
    };

    constructor(params: NotificationParams, id: number) {
        this.title = params.title;
        this.hidden = false;
        this.id = id;
        this.variant = params.variant;
        this.message = params.message;
        this.closable = params.closable;
        this.additionalInfo = params.additionalInfo;
        this.minimizable = this.variant === Variant.LOADING;
        this.link = params.link;
        this.indefinite = params.indefinite;
        this.transactionFlow = params.transactionFlow;
    }

    remove() {
        this.close = true;
    }

    setSuccess(message: string, indefinite = false) {
        this.indefinite = indefinite;
        this.closable = indefinite;
        this.variant = Variant.SUCCESS;
        this.message = message;
        this.minimizable = false;
    }

    setError(message: string, indefinite = false) {
        this.indefinite = indefinite;
        this.closable = indefinite;
        this.minimizable = false;
        this.message = message;
        this.variant = Variant.ERROR;
    }
}

export class NotificationStepsData {
    constructor(readonly steps: { finished: boolean; processing: boolean; link?: Link }[]) {}

    setLink(link: string) {
        const index = this.steps.findIndex((s) => s.processing);

        if (index !== -1) {
            this.steps[index].link = {
                name: 'View',
                href: getTxSolscanUrl(link),
            };
        }
    }

    nextStep() {
        const index = this.steps.findIndex((s) => s.processing);

        if (index !== -1) {
            this.steps[index].processing = false;
            this.steps[index].finished = true;

            if (index < this.steps.length - 1) {
                this.steps[index + 1].processing = true;
            }
        }

        return !this.steps.some((s) => !s.finished);
    }
}

export enum ParallelDataState {
    NONE,
    PROCESSING,
    FINISHED,
    ERROR,
}

export type NotificationClaimStake = {
    index: number;
    state: ParallelDataState;
    claim: number;
    link?: Link;
    tx: web3.Transaction;
};

export type NotificationClaimStakes = {
    [mint: string]: {
        totalClaim: number;
        totalClaimFormatted?: string;
        name: string;
        stakes: NotificationClaimStake[];
    };
};

export class NotificationStakesClaimData {
    constructor(readonly stakes: NotificationClaimStakes) {}

    get totalClaim() {
        const totalClaim = Object.values(this.stakes).reduce((acc, stake) => acc + stake.totalClaim, 0);

        return totalClaim ? formatNumberToDecimal(totalClaim) : 0;
    }
}
