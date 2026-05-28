import axios, { type AxiosResponse } from 'axios';
import { config } from '../config';
import { TEST_CLEANUP_SECRET } from '../fixtures';
// import { expectRejected } from '../test-units';

const url = `${config.BASE_URL}/signin`;
const wrongCredentials = { username: 'notarealuser99999', password: 'WrongPass@9999' };
const currentUserUrl = `${config.BASE_URL}/currentuser`;
// const signOutUrl = `${config.BASE_URL}/signout`;


let response!: AxiosResponse;
let sessionCookie: string = '';

beforeAll(async () => {
    response = await axios.post(url, {
        username: config.TEST_USER_USERNAME,
        password: config.TEST_USER_PASSWORD,
    }, { headers: { 'x-test-secret': TEST_CLEANUP_SECRET }, validateStatus: () => true });

    const raw = response.headers['set-cookie'];
    const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
    sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
});

afterAll(async () => {
    if (!sessionCookie) return;
    await axios.post(`${config.BASE_URL}/signout`, {}, {
        headers: { Cookie: sessionCookie },
        validateStatus: () => true,
    });
});


describe('AUTH-FLOW RESPONSE', () => {

    it('successful signin returns status 200 with token and user', () => {
        // write your code here
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
        expect(response.data).toHaveProperty('user');
        expect(response.data.message).toBe('User login successfully');
        expect(response.data.token).toBeDefined();
        expect('response.data.user').toBeDefined();
    });

    it('token has valid JWT format', () => {
        // write your code here
        const tokenParts = response.data.token.split('.');
        expect(tokenParts.length).toBe(3);
        tokenParts.forEach((part: any, index: any) => {
            if (index === 0) {
                expect(part.startsWith('eyJ')).toBe(true); // JWT tokens typically start with 'eyJ'
            }
            expect(part.length).toBeGreaterThan(0);
            expect(part).toMatch(/^[A-Za-z0-9-_]+$/);
        });

        expect(response.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('cookie is set and password is not exposed', () => {
        // write your code here
        expect(response.headers['set-cookie']).toBeDefined();
        const raw = response.headers['set-cookie'];
        const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
        expect(sessionCookie).toBeDefined();
        expect(sessionCookie).toContain('session=');
        expect(response.data).not.toHaveProperty('password');
    });

    it('GET/ currentuser session cookie works for authenticated request', async () => {
        // write your code here
        const raw = response.headers['set-cookie'];
        const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');

        expect(sessionCookie).toBeDefined();

        const currentUserResponse = await axios.get(currentUserUrl, {
            headers: { Cookie: sessionCookie },
            validateStatus: () => true,
        });
        expect(currentUserResponse.status).toBe(200);
        expect(currentUserResponse.data).toHaveProperty('user');
    });

    it('token matches JWT regex — toMatch', async () => {
        // write your code here
        expect(response.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('session cookie matches "session=" pattern — expect.stringMatching', () => {
        // write your code here
        const raw = response.headers['set-cookie'];
        const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
        expect(sessionCookie).toEqual(expect.stringMatching(/session=[A-Za-z0-9-_]+/));
        expect(sessionCookie).toMatch(/session=[A-Za-z0-9-_]+/);
        expect(sessionCookie).toContain('session=');
    });

});

describe('NEGATIVE CASES FOR CURRENT USER', () => {

    it('rejects wrong password — .then() style', () => {
        return axios.post(url, wrongCredentials, { validateStatus: () => true })
            .then(res => {
                expect(res.status).toBe(400);
                expect(res.data).toHaveProperty('message');
                expect(res.data).toHaveProperty('statusCode');
            });
    });


});

     