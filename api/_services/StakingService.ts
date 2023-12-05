import axios from 'axios';

import { logger } from '@/plugins/logger.client';

import { Root, Path, SubPath } from '@/api/resources';
import { StakingNftInfo } from '~/types/Staking.types';

class StakingService {
    async findNftConstants(tokens: string[]): Promise<StakingNftInfo[]> {
        const res = await axios.post(`${Root.STAKING}/${Path.INFO}/${SubPath.INFO.FIND_NFT_CONSTANTS}`, {
            tokens,
        });

        return res.data;
    }
}

export default new StakingService();
