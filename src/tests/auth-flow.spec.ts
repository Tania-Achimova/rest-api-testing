import axios, { Axios, AxiosResponse } from 'axios';
import { config } from '../config';
import { TEST_CLEANUP_SECRET } from '../fixtures';
import { expectRejected } from '../test-units';


const url = `${config.BASE_URL}/signin`;
const signOutUrl = `${config.BASE_URL}/auth/signout`;
const currentUserUrl = `${config.BASE_URL}/currentuser`;

const credentials = {
    username: config.TEST_USER_USERNAME,
    password: config.TEST_USER_PASSWORD
};

let signInResponse!: AxiosResponse;
let sessionCookie: string;

beforeAll(async () => {
    // Ensure the test user exists before running tests
    signInResponse = await axios.post(url, credentials, {
        headers: {
            'x-test-secret': TEST_CLEANUP_SECRET,
        },
        validateStatus: () => true, // Accept all status codes
    })

    const raw = signInResponse.headers['set-cookie'];
    const cookies = (() => {
        if (Array.isArray(raw)) return raw;
        if (raw) return [raw];
        return [];
    })();

    sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
});

afterAll(async () => {
    if(!sessionCookie) return;
    await axios.post(signOutUrl, {}, {
        headers: { Cookie: sessionCookie },
        validateStatus: () => true,
    });
});


describe('Authentication Flow', () => {
    it('status code 200', async () => {
        // console.log(signInResponse);
        expect(signInResponse.status).toBe(200);
    });

    it('user should signin successfully', async () => {
        expect(signInResponse.data.message).toBe('User login successfully');
    });

    it('response body has the correct top-level shape', async () => {
        expect(signInResponse.data).toMatchObject({
            message: expect.any(String),
            token: expect.any(String),
            user: expect.any(Object),
        });
    });
});

describe('AUTH FLOW - NEGATIVE CASES', () => {

    it('token is not empty string', async () => {
        expect(typeof signInResponse.data.token).toBe('string');
        expect(signInResponse.data.token.length).toBeGreaterThan(0);
    });

    it('token has JWT format - three dot-separated parts', async () => {
        const tokenParts: string[] = signInResponse.data.token.split('.');
        expect(tokenParts.length).toBe(3);

        tokenParts.forEach(part => {
            expect(part.length).toBeGreaterThan(0);
            expect(part).toMatch(/^[A-Za-z0-9-_]+$/);
        });
    });
});

describe('Session cookies', () => {

    it('set-cookie header should be present in the response', async () => {
        expect(signInResponse.headers['set-cookie']).toBeDefined();
    });

    it('set-cookies header is an array', async () => {
        expect(Array.isArray(signInResponse.headers['set-cookie'])).toBe(true);
    });

    it('set-cookie header should contain HTTPOnly directive', async () => {
        const raw = signInResponse.headers['set-cookie'] ?? [];
        const rawStr = Array.isArray(raw) ? raw.join(';') : raw;
        expect(rawStr.toLowerCase()).toContain('httponly');
    });
});

describe('USER OBJECT', () => {

    it('user object has expected fields', async () => {
        expect(signInResponse.data.user).toMatchObject({
            _id: expect.any(String),
            username: expect.any(String),
            email: expect.any(String),
            avatarColor: expect.any(String),
            postsCount: expect.any(Number),
            followersCount: expect.any(Number),
            followingCount: expect.any(Number),
        });
    });

    it('postsCount, followersCount, followingCount are positive numbers', async () => {
        const { postsCount, followersCount, followingCount } = signInResponse.data.user;
        expect(postsCount).toBeGreaterThanOrEqual(0);
        expect(followersCount).toBeGreaterThanOrEqual(0);
        expect(followingCount).toBeGreaterThanOrEqual(0);
    });

});

describe.only('AUTHENTICATED REQUESTS', () => {

    it('GET/ currentuser with cookie return 200', async () => {

        const response = await axios.get(currentUserUrl, {
            headers: { Cookie: sessionCookie },
            validateStatus: () => true,
        });
        console.log('Current user response:', response.data);
        expect(response.status).toBe(200);
    });

    it('GET/ currentuser without cookie return 401', async () => {

        const response = await axios.get(currentUserUrl, {
            headers: {},
            validateStatus: () => true,
        });
        expect(response.status).toBe(401);
    });


});


describe('NEGATIVE CASES', () => {

    it('wrong password should return 400', async () => {
        const res = await axios.post(url, {
            username: config.TEST_USER_USERNAME,
            password: 'WrongPassword'
        }, { validateStatus: () => true });

        expectRejected(res.status);
        if (res.status === 400) {
            expect(res.data.message).toBe('Invalid credentials');
        }
    });

    it('server return 500 should handle gracefully', async () => {
        const res = await axios.post(url, {
            username: config.TEST_USER_USERNAME,
            password: 'WrongPassword'
        }, { validateStatus: () => true });

        expectRejected(res.status);
        if (res.status === 500) {
            expect(res.data.message).toBe('Internal server error');
        }
    });

});

describe('RESPONSE TIME', () => {
    it('signin response time is within acceptable limits', async () => {
        const startTime = Date.now();
        await axios.post(url, credentials, {
            validateStatus: () => true,
        });
        expect(Date.now() - startTime).toBeLessThan(2000); // Expect response time to be less than 2 seconds
    });
});

describe('REGEX', () => {
    it('token matches JWT regex pattern - toMatch', async () => {
        expect(signInResponse.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('token matches JWT regex pattern - toSatisfy', async () => {
        expect(signInResponse.data.token).toSatisfy((token: string) => {
            return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
        });
    });
});