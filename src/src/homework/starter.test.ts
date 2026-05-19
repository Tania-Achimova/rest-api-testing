import axios, { type AxiosResponse } from 'axios';
import { config } from '../config';

const url = `${config.BASE_URL}/signin`;
const wrongCredentials = { username: 'notarealuser99999', password: 'WrongPass@9999' };

let response!: AxiosResponse;

beforeAll(async () => {
    response = await axios.post(url, wrongCredentials, {
        validateStatus: () => true, // Accept all status codes
    });
});

describe('EXACT VALUE', () => {
    it('response body matches the error shape', () => {
        if (response.status === 429) {
            expect(response.data).toHaveProperty('message');
            return;
        }
        expect(response.data).toMatchObject({
            message: expect.any(String),
            statusCode: expect.any(Number),
        });
    });
});

describe('EXACT VALUE ASSERTIONS', () => {
    it('response does not leak token, user, or password', () => {
        if (response.status === 429) return
        expect(response.data).not.toHaveProperty('token');
        expect(response.data).not.toHaveProperty('user');
        expect(response.data).not.toHaveProperty('password');
    });

});

describe('SHAPE VALIDATION', () => {
    it('Content-Type is JSON and status is not a success code', () => {
        if (response.status === 429) return
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.status).toBeGreaterThanOrEqual(400);
    });
});

describe('ADDITIONAL ASSERTIONS', () => {
    it('username shorter than 4 chars is rejected', async () => {
        const res = await axios.post(
            url,
            { username: 'abc', password: 'ValidPass@1' },
            { validateStatus: () => true },
        );
        expect(res.status).toBe(400);
    });
});

describe('RESPONSE TIME', () => {
    it('response body matches error shape — .then() style', () => {
        // write your code here
        return axios.post(
            url,
            wrongCredentials,
            { validateStatus: () => true }
        ).then(res => {
            if (res.status === 429) {
                expect(res.data).toHaveProperty('message');
                return;
            }
        });
    });

});
