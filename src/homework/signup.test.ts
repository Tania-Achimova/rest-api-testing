import axios, { type AxiosResponse } from 'axios';
import { faker } from '@faker-js/faker';
import { config } from '../config';
import { TEST_AVATAR_IMAGE, TEST_AVATAR_COLOR, TEST_CLEANUP_SECRET } from '../fixtures';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { expectRejected } from '../test-units'


const signupUrl = `${config.BASE_URL}/signup`;
const cleanupUrl = (userId: string) => `${config.BASE_URL}/test/cleanup/user/${userId}`;

let response!: AxiosResponse;
let authId: string = '';

beforeAll(async () => {
    response = await axios.post(signupUrl, {
        username: `vitest${faker.string.alphanumeric(8).toLowerCase()}`,
        email: faker.internet.email().toLowerCase(),
        password: config.TEST_USER_PASSWORD,
        avatarColor: TEST_AVATAR_COLOR,
        avatarImage: TEST_AVATAR_IMAGE,
    }, { validateStatus: () => true });

    authId = response.data.user?.authId ?? '';

});

afterAll(async () => {
    if (!authId) return;
    await axios.delete(cleanupUrl(authId), {
        headers: { 'x-test-secret': TEST_CLEANUP_SECRET },
        validateStatus: () => true,
    });
});

describe('SIGNUP FLOW RESPONSE', () => {

    it('signup response has correct status, message, and user shape', () => {
        expect(response.status).toBe(201);
        expect(response.data.user).toBeDefined();
        expect(response.data.message).toBe('User created successfully');
        expect(typeof response.data.user._id).toBe('string');
        expect(response.data.user._id).not.toBe('');
        expect(typeof response.data.user.authId).toBe('string');
        expect(response.data.user.authId).not.toBe('');
        expect(response.data.user).not.toHaveProperty('password');
    });

    it('response body matches expected shape and token is valid JWT', () => {
        // write your code here
        expect(response.data).toMatchObject({
            message: expect.any(String),
            token: expect.any(String),
            user: expect.any(Object)
        });
    });

    it('cleanup endpoint returns 403 with wrong secret — .then() style', () => {
        // write your code 
        return axios.delete(cleanupUrl(authId), {
            headers: { 'x-test-secret': 'wrong-secret' },
            validateStatus: () => true,
        }).then(res => {
            expect(res.status).toBe(403);
        });
    });

    it('email matches email format regex — toMatch', () => {
        // write your code here
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(response.data.user.email).toMatch(emailRegex);
    });

    it('token is a valid JWT — toSatisfy with custom predicate', () => {
        // write your code here
        expect(response.data.token).toSatisfy((t: string) => t.split('.').length === 3);
    });
});

describe('SIGNUP FLOW ERROR HANDLING', () => {

    it('duplicate email returns 400', async () => {
        // write your code here
        const sharedEmail = faker.internet.email().toLowerCase();
        
        await axios.post(signupUrl, {
            username: 'TestCodeUser',
            email: sharedEmail,
            password: config.TEST_USER_PASSWORD,
            avatarColor: TEST_AVATAR_COLOR,
            avatarImage: TEST_AVATAR_IMAGE,
        }, { validateStatus: () => true });

        const duplicateResponse = await axios.post(signupUrl, {
            username: 'TestCodeUser',
            email: sharedEmail,
            password: config.TEST_USER_PASSWORD,
            avatarColor: TEST_AVATAR_COLOR,
            avatarImage: TEST_AVATAR_IMAGE,
        }, { validateStatus: () => true });

        console.log('Duplicate email response:', duplicateResponse.status, duplicateResponse.data);
        expectRejected(duplicateResponse.status)
        if (duplicateResponse.status === 400) {
            expect(duplicateResponse.data.message).toContain('already');
        }
    });

    it('password without special character is rejected', async () => {
        const invalidPasswordResponse = await axios.post(signupUrl, {
            username: `vitest${faker.string.alphanumeric(8).toLowerCase()}`,
            email: faker.internet.email().toLowerCase(),
            password: 'Password123', // No special character
            avatarColor: TEST_AVATAR_COLOR,
            avatarImage: TEST_AVATAR_IMAGE,
        }, { validateStatus: () => true });

        expectRejected(invalidPasswordResponse.status);
        if (invalidPasswordResponse.status === 400) {
            expect(invalidPasswordResponse.data.message).toContain('must be');
        }
    });

});
