import axios, { AxiosResponse } from 'axios';
import { config } from '../config';
import { TEST_AVATAR_IMAGE, TEST_AVATAR_COLOR, TEST_CLEANUP_SECRET } from '../fixtures';
import { faker } from '@faker-js/faker';

const signupUrl = `${config.BASE_URL}/signup`;
const cleanupUrl = (userId: string) => `${config.BASE_URL}/test/cleanup/user/${userId}`;

const newUser = {
    username: `vitest${faker.string.alphanumeric(8).toLowerCase()}`,
    password: process.env.TEST_USER_PASSWORD,
    email: faker.internet.email().toLowerCase(),
    avatarColor: TEST_AVATAR_COLOR,
    avatarImage: TEST_AVATAR_IMAGE,
};
console.log('New user for signup test:', newUser);

let signupResponse: AxiosResponse;
let authId: string = '';

beforeAll(async () => {
    signupResponse = await axios.post(signupUrl, newUser, {
        headers: {
            'x-test-secret': TEST_CLEANUP_SECRET,
        },
        validateStatus: () => true,
    });

    authId = signupResponse.data?.user?.authId ?? '';


    await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
    await axios.delete(cleanupUrl(authId), {
        headers: {
            'x-test-secret': TEST_CLEANUP_SECRET,
        },
        validateStatus: () => true,
    });
});

describe('SIGNUP FLOW RESPONSE', () => {

    it('should return successful signup ', () => {
        console.log('Signup response:', signupResponse.data);
        expect(signupResponse.status).toBe(201);
    });

});