import axios, { AxiosResponse } from 'axios';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { expectRejected } from '../test-units';
import { config } from '../config';
import { TEST_CLEANUP_SECRET } from '../fixtures';

const credentials = {
    username: config.TEST_USER_USERNAME,
    password: config.TEST_USER_PASSWORD,
};
const currentUserUrl = `${config.BASE_URL}/current-user`;
const signoutUrl = `${config.BASE_URL}/logout`;
const signinUrl = `${config.BASE_URL}/signin`; // Base URL for profile-related endpoints
const settingsUrl = `${config.BASE_URL}/user/profile/settings`;
const basicInfoUrl = `${config.BASE_URL}/user/profile/basic-info`;


let signInResponse!: AxiosResponse;
let sessionToken: string;

//Value captured in beforeAll to be used in tests and cleanup
let originalWork: string = '';
let originalQuote: string = '';
let originalReactions: boolean = true;
let originalFollows: boolean = true;


beforeAll(async () => {
    await axios.post(signinUrl, credentials, {
        headers: {
            'x-test-secret': TEST_CLEANUP_SECRET,
        },
        validateStatus: () => true
    });

    const raw = signInResponse.headers['set-cookie'];
    const cookies = (() => {
        if (Array.isArray(raw)) return raw;
        if (raw) return [raw];
        return [];
    })();
    sessionToken = cookies.map(c => c.split(';')[0]).join('; ');

    const currentUserResponse = await axios.get(currentUserUrl, {
        headers: {
            Cookie: sessionToken,
        },
        validateStatus: () => true
    });
    //console.log('Current User Response:', currentUserResponse.data);

    originalWork = currentUserResponse.data.user?.work ?? '';
    originalQuote = currentUserResponse.data.user?.quote ?? '';
    originalReactions = currentUserResponse.data.user?.reactionsEnabled ?? true;
    originalFollows = currentUserResponse.data.user?.followsEnabled ?? true;

    await axios.put(settingsUrl, {
        messages: true,
        reactions: true,
        follows: originalFollows,
    }, {
        headers: {
            Cookie: sessionToken,
        },
        validateStatus: () => true
    });

});

afterAll(async () => {
    await axios.put(basicInfoUrl, {
        work: originalWork,
        quote: originalQuote,
    }, {
        headers: {
            Cookie: sessionToken,
        },
        validateStatus: () => true
    });
    const currentUserResponse = await axios.get(currentUserUrl, {
        headers: {
            Cookie: sessionToken,
        },
        validateStatus: () => true
    }).then(console.log);
    console.log('Current User Response After Restore:', currentUserResponse);
});

describe('UPDATE BASIC INFO', () => {
    it('updatee should be successful with status 200', async () => {
        const res = await axios.put(basicInfoUrl, {
            work: 'Senior QA Engineer',
            quote: 'Testing is my passion!',
        }, {
            headers: {
                Cookie: sessionToken,
            },
            validateStatus: () => true
        });
        const currentUserResponse = await axios.get(currentUserUrl, {
            headers: {
                Cookie: sessionToken,
            },
            validateStatus: () => true
        });
        //console.log('Current User Response After Update:', currentUserResponse.data);

        expect(res.status).toBe(200);
    });

    it('should receive message "Updated successfully" in response body', async () => {
        const res = await axios.put(basicInfoUrl, {
            work: 'Senior QA Engineer',

        }, {
            headers: {
                Cookie: sessionToken,
            },
            validateStatus: () => true
        });
        expect(res.data.message).toBe('Updated successfully');
    });

});

describe('STATE VERIFICATION', () => {

    const run = Date.now();

    const testWork = `Senior QA Engineer=${run}`;
    const testQuote = `Testing is my passion!=${run}`;

    beforeAll(async () => {
        await axios.put(basicInfoUrl, {
            work: testWork,
            quote: testQuote,
        }, {
            headers: {
                Cookie: sessionToken,
            },
            validateStatus: () => true
        });
    });

    it('GET/ current user should reflect updated work and quote', async () => {
        const res = await axios.get(currentUserUrl, {
            headers: {
                Cookie: sessionToken,
            },
            validateStatus: () => true
        });

        const work = res.data.user.work?.replace(/^"|"?/g, ''); // 
        const quote = res.data.user.quote?.replace(/^"|"?/g, ''); // Normalize dynamic part for comparison

        console.log('Current User Response for State Verification:', res.data);
        expect(work).toBe(testWork);
        expect(quote).toBe(testQuote);
        console.log('State verification passed with work and quote:', work, quote);
    });
});

describe('UPDATE NOTIFICATIONS SETTINGS', () => {

    it('GET/ current ', async () => {
        const res = await axios.put(settingsUrl, {
            reactions: false,
            follows: false,
        },
            {
                headers: {
                    Cookie: sessionToken,
                },

                validateStatus: () => true,
            });

        expect(res.status).toBe(200);
    });

    it('message is "Notifications settings updated successfully"', async () => {
        const res = await axios.put(settingsUrl, {
            reactions: false,
        },
            {
                headers: {
                    Cookie: sessionToken,
                },

                validateStatus: () => true,
            });

        expect(res.data.message).toBe('Notifications settings updated successfully');
    });

    it('GET/ current user should reflect updated notifications settings', async () => {
        const res = await axios.get(currentUserUrl, {
            headers: {
                Cookie: sessionToken,
            },
            validateStatus: () => true
        });
        const currentUserResponse = await axios.get(currentUserUrl, {
            headers: {
                Cookie: sessionToken,
            },
            validateStatus: () => true
        });
        console.log('Current User Response for Notifications Verification:', currentUserResponse.data);
        expect(currentUserResponse.data.user.notificationsEnabled).toBe(false);
        expect(currentUserResponse.data.user.followsEnabled).toBe(false);
    });

});
