import axios from 'axios';
import { useEnv } from '@skyslit/ark-core';
import https from 'https';

export default {
    fetchDemoDataByProjectId: async (projectId: string, includeAll: boolean = false) => {
        try {
            const res = await axios({
                method: 'POST',
                baseURL: useEnv("COMPASS_ENDPOINT") || 'https://compass.skyslit.com',
                url: '/___service/compass/getArchivedDemoReleasesByProjectId',
                data: {
                    projectId,
                    includeAll
                }
            })
            return res?.data?.data || [];
        } catch (e) {
            console.log(e?.response);
            throw new Error(e?.response?.message ? e?.response?.message : e?.message);
        }
    }
}