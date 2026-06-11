import axios, { type AxiosResponse } from 'axios';
import { config } from '../config';
import { TEST_CLEANUP_SECRET } from '../fixtures';

const signinUrl = `${config.BASE_URL}/signin`;
const currentUserUrl = `${config.BASE_URL}/currentuser`;
const basicInfoUrl = `${config.BASE_URL}/user/profile/basic-info`;
const settingsUrl = `${config.BASE_URL}/user/profile/settings`;
const signoutUrl = `${config.BASE_URL}/signout`;

let sessionCookie: string = '';
let originalLocation: string = '';
let originalMessages: boolean = true;

beforeAll(async () => {
    const loginRes = await axios.post(signinUrl, {
        username: config.TEST_USER_USERNAME,
        password: config.TEST_USER_PASSWORD,
    }, {
        headers: { 'x-test-secret': TEST_CLEANUP_SECRET },
        validateStatus: () => true
    });

    const raw = loginRes.headers['set-cookie'];
    const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
    sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');

    const currentRes = await axios.get(currentUserUrl, {
        headers: { Cookie: sessionCookie },
        validateStatus: () => true,
    });
    originalLocation = currentRes.data.user?.location ?? '';
    originalMessages = currentRes.data.user?.notifications?.messages ?? true;
});

afterAll(async () => {
    await axios.put(basicInfoUrl,
        { location: originalLocation },
        { headers: { Cookie: sessionCookie }, validateStatus: () => true },
    );
    await axios.put(settingsUrl,
        { messages: originalMessages },
        { headers: { Cookie: sessionCookie }, validateStatus: () => true },
    );
    await axios.post(signoutUrl, {}, {
        headers: { Cookie: sessionCookie }, validateStatus: () => true,
    });
});
describe('PROFILE FLOW RESPONSE', () => {

    it('current user response has correct shape', async () => {
        const response = await axios.get(currentUserUrl, {
            headers: { Cookie: sessionCookie },
            validateStatus: () => true,
        });
        expect(response.status).toBe(200);
        expect(response.data.isUser).toBe(true);
        expect(response.data.user._id).toBeDefined();
        expect(response.data.user).not.toHaveProperty('password');
    });

    it('current user isUser is true and token is string — .then() style', () => {
        // write your code here
        return axios.get(currentUserUrl, {
            headers: { Cookie: sessionCookie },
            validateStatus: () => true,
        }).then(res => {
            expect(res.data.isUser).toBe(true);
            expect(typeof res.data.token).toBe('string');
        });

    });

    it('postsCount and followersCount are non-negative — toBeGreaterThanOrEqual', async () => {
        // write your code here
        const response = await axios.get(currentUserUrl, {
            headers: { Cookie: sessionCookie },
            validateStatus: () => true,
        });
        const postsCount = response.data.user?.postsCount ?? 0;
        const followersCount = response.data.user?.followersCount ?? 0;
        expect(postsCount).toBeGreaterThanOrEqual(0);
        expect(followersCount).toBeGreaterThanOrEqual(0);
    });

    it('username is truthy — toBeTruthy', async () => {
        // write your code here
        const response = await axios.get(currentUserUrl, {
            headers: { Cookie: sessionCookie },
            validateStatus: () => true,
        });
        const username = response.data.user?.username ?? '';
        expect(username).toBeTruthy();
    });

});

describe('UPDATE BASIC INFO', () => {

    it('PUT /basic-info updates location and GET /currentuser reflects it', async () => {
        // write your code here
        const newLocation = "Test City";

        await axios.put(basicInfoUrl, { location: newLocation }, {
            headers: { Cookie: sessionCookie },
            validateStatus: () => true,
        });
        console.log('Location updated to:', newLocation);
        const currentRes = await axios.get(currentUserUrl, {
            headers: { Cookie: sessionCookie },
            validateStatus: () => true,
        });

        const rawLocation = currentRes.data.user?.location ?? '';
        const cleanLocation = rawLocation.replace(/^"|"$/g, '');

        console.log('Current Location from API:', cleanLocation);
        expect(currentRes.data.user).toBeDefined();
        expect(cleanLocation).toBe(newLocation);

    });

    it('PUT /settings updates messages to false', async () => {
        // write your code here

        await axios.put(settingsUrl, { messages: false }, {
            headers: { Cookie: sessionCookie },
            validateStatus: () => true,
        });

        const currentRes = await axios.get(currentUserUrl, {
            headers: { Cookie: sessionCookie },
            validateStatus: () => true,
        });
        console.log('Current User Response for Messages Setting Verification:', currentRes.data);
        expect(currentRes.status).toBe(200);


        const messagesSetting = currentRes.data.user?.notifications?.messages;
        console.log('Current messages setting from API:', messagesSetting);
        expect(messagesSetting).toBe(false);

    });

    it('PUT /basic-info without cookie returns 401', async () => {
        // write your code here
        const response = await axios.put(basicInfoUrl, { location: "Unauthorized City" }, {
            validateStatus: () => true,
        });
        expect(response.status).toBe(401);

    });

});
