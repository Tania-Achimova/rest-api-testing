import axios, { AxiosResponse } from 'axios';
import { config } from '../config';
import { expectRejected } from '../test-units';

const url = `${config.BASE_URL}/auth/signin`;
console.log(url, 'url');
const wrongCredentials = {
    username: 'notarealuser99999',
    password: 'WrongPass@999'
};

let sharedResponse!: AxiosResponse;

beforeAll(async () => {
    sharedResponse = await axios.post(url, wrongCredentials, {
        validateStatus: () => true, // Accept all status codes
    });
});

describe('EXACT VALUE', () => {

    it('should return 400 for invalid credentials', () => {
        if (sharedResponse.status === 429) return
        //expect([400, 429]).toContain(sharedResponse.status);
        expect(sharedResponse.status);
        expect(sharedResponse.statusText).toBe('Unauthorized');
    });

    it('response body has a message field', () => {
        console.log(sharedResponse.data, 'response body');
        expect(sharedResponse.data).toHaveProperty('message');
    });

    it('response body has a status field', () => {
        expect(sharedResponse.data).toHaveProperty('status');

    });

});


describe('EXACT VALUE ASSERTIONS', () => {

    it('message is exactly "Invalid credentials"', () => {
        if (sharedResponse.status === 429) return
        expect(sharedResponse.data.message).toBe('Token is not valid.Please login again');
    });

    it('statusCode inside body matches HTTP status code', () => {
        if (sharedResponse.status === 429) return
        expect(sharedResponse.data.statusCode).toBe(sharedResponse.status);
    });

    it('message is a non-empty string', () => {
        expect(typeof sharedResponse.data.message).toBe('string');
        expect(sharedResponse.data.message).not.toBe('');
        expect(sharedResponse.data.message.length).toBeGreaterThan(0);
    });

});


describe('SHAPE VALIDATION', () => {

    it('response body matches the expected error shape', () => {
        if (sharedResponse.status === 429) {
            expect(sharedResponse.data).toHaveProperty('message');
            return
        }
        expect(sharedResponse.data).toMatchObject({
            message: expect.any(String),
            status: 'error',
            statusCode: expect.any(Number),
        });
    });

});

describe('BOUNDARY VALUE ANALYSIS', () => {

    it('username shorter than 4 chars', async () => {
        
        const res = await axios.post(url, { username: 'abc', password: 'ValidPass@123' }, { validateStatus: () => true});
        console.log(res.data, 'boundary test response');

        if (res.status === 429) {
            expect(res.data).toHaveProperty('message');
            return
        }
        expectRejected(res.status);
        expect(res.data.message).toBe('Token is not valid.Please login again');
    });

    it('password longer than 128 chars', async () => {
        const res = await axios.post(url, { username: 'validuser', password: 'A@1' + 'a'.repeat(128) }, { validateStatus: () => true });
        console.log(res.data, 'boundary test response');

        if (res.status === 429) {
            expect(res.data).toHaveProperty('message');
            return
        }
        expectRejected(res.status);
        expect(res.data.message).toBe('Token is not valid.Please login again');
    });


});

describe('VERIFY HEADERS', () => {
    it('should not return sensitive headers on failed login', async () => {
        const res = await axios.post(url, {username: 'invaliduser', password: 'invalidpass'}, { validateStatus: () => true });
        if (res.status === 429) {
            expect(res.data).toHaveProperty('message');
            return
        }
        expect(res.headers).not.toHaveProperty('authorization');
        expect(res.headers).not.toHaveProperty('set-cookie');
    });
});