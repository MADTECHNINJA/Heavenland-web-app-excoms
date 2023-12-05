import { reactive } from 'vue';

export type StepsParam = {
    id: number;
    title: string;
    component: any;
};

export class Steps {
    steps: Array<StepsParam & { status: 'current' | 'completed' | 'upcoming' }>;

    constructor(steps: Array<StepsParam>) {
        if (!steps.length) {
            throw new Error('invalid: steps are empty');
        }

        this.steps = reactive(
            steps.map((s) => {
                return {
                    id: s.id,
                    title: s.title,
                    component: s.component,
                    status: 'upcoming',
                };
            })
        );

        this.steps[0].status = 'current';
    }

    get currentStep() {
        return this.steps.find((s) => s.status === 'current').component;
    }

    previousStep() {
        const currentStep = this.steps.findIndex((s) => s.status === 'current');

        this.steps[currentStep].status = 'upcoming';

        if (currentStep > 0) {
            this.steps[currentStep - 1].status = 'current';
        }
    }

    nextStep() {
        const currentStep = this.steps.findIndex((s) => s.status === 'current');

        this.steps[currentStep].status = 'completed';

        if (currentStep < this.steps.length - 1) {
            this.steps[currentStep + 1].status = 'current';
        }
    }
}
