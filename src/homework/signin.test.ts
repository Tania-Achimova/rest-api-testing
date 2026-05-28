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

describe('POSITIVE CASES', () => {

    it('response body matches the error shape', () => {
        if (response.status === 429) {
            expect(response.data).toHaveProperty('message');
            return;
        }
        expect(response.data).toMatchObject({
            message: expect.any(String),
            statusCode: expect.any(Number),
        });
        expect(response.data).toHaveProperty('statusCode');
        expect(typeof response.data.message).toBe('string');
        expect(typeof response.data.statusCode).toBe('number');
        expect(response.data.message.length).toBeGreaterThan(0);
        expect(response.data.statusCode).toBe(response.status);
    });

    it('Content-Type is JSON and status is not a success code', () => {
        if (response.status === 429) return
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('response body matches error shape — .then() style', () => {
        return axios.post(
            url,
            wrongCredentials,
            { validateStatus: () => true }
        ).then(res => {
            if (res.status === 429) {
                expect(res.data).toHaveProperty('message');
                return;
            }
            expect(res.data).toMatchObject({
                message: expect.any(String),
                statusCode: expect.any(Number),
            });
            expect(res.data).toHaveProperty('statusCode');
            expect(typeof res.data.message).toBe('string');
            expect(typeof res.data.statusCode).toBe('number');
            expect(res.data.message.length).toBeGreaterThan(0);
            expect(res.data.statusCode).toBe(res.status);
            expect(res.headers['content-type']).toMatch(/application\/json/);
            expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });

    it('message matches non-empty string regex — toMatch', () => {
        if (response.status === 429) return
        expect(response.data.message).toMatch(/^.{1,}$/);
        expect(response.data.message).toMatch(/^\S.*\S$|^\S$/);
        expect(response.data.message).toMatch(/^[\w\s@!#$%^&*()\-+=]{1,}$/);
    });

    it('message is a non-empty string — multiple assertions', () => {
        if (response.status === 429) return
        expect(typeof response.data.message).toBe('string');
        expect(response.data.message).not.toBe('');
        expect(response.data.message.length).toBeGreaterThan(0);
    });

});

describe('NEGATIVE CASES', () => {

    it('response does not leak token, user, or password', () => {
        if (response.status === 429) return
        expect(response.data).not.toHaveProperty('token');
        expect(response.data).not.toHaveProperty('user');
        expect(response.data).not.toHaveProperty('password');
    });

    it('username shorter than 4 chars is rejected', async () => {
        const res = await axios.post(
            url,
            { username: 'abc', password: 'ValidPass@1' },
            { validateStatus: () => true },
        );
        expect(res.status).toBe(400);
    });

});


describe('STATUS CODE ASSERTIONS', () => {

    it('status code is either 400 or 429', () => {
        console.log(response.status, 'status code');
        //expect([400, 429]).toContain(sharedResponse.status);
        expect(response.status);
        expect(response.statusText).toBe('Bad Request');
        expect([400, 429]).toContain(response.status);

    });
});
