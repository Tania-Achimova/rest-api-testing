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
    //console.log('beforeAll');
});

afterAll(async () => {
    await axios.delete(cleanupUrl(authId), {
        headers: {
            'x-test-secret': TEST_CLEANUP_SECRET,
        },
        validateStatus: () => true,
    });
        //console.log('afterAll');
});

beforeEach(async () => {console.log('1')});
afterEach(async () => {console.log('2')});

describe('SIGNUP FLOW RESPONSE', () => {

    it('should return successful signup ', () => {
        console.log('Signup response:', signupResponse.data);
        expect(signupResponse.status).toBe(201);
    });

    it('should contain correct message for signup', () => {
        expect(signupResponse.data).toHaveProperty('message', 'User created successfully');
    });

    it('response body has the correct top-level shape', () => {
        expect(signupResponse.data).toHaveProperty('user');
    });

});

describe('USER OBJECT', () => {

    it('user has _id and authId', () => {
        expect(signupResponse.data.user).toHaveProperty('_id');
        expect(signupResponse.data.user).toHaveProperty('authId');
        expect(signupResponse.data.user).toMatchObject({
            _id: expect.any(String),
            authId: expect.any(String),
        });
    });

    it('username is titled-casses version of what was sent in request', () => {
        const receivedUsername = signupResponse.data.user.username.toLowerCase();
       expect(receivedUsername).toBe(newUser.username.toLowerCase());
    });

    it('email is lowercased version of what was sent in request', () => {
        const receivedEmail = signupResponse.data.user.email;
        expect(receivedEmail).toBe(newUser.email.toLowerCase());
    });

    // it('avatarColor and avatarImage match what was sent in request', () => {
       
    // });

    it ('password is not in the user object', () => {
        expect(signupResponse.data.user).not.toHaveProperty('password');
    });

});

describe('COOKIES', () => {

    it('set-cookie header is defined', async () => {
        expect(signupResponse.headers).toHaveProperty('set-cookie');
    });

});

describe('PROTECTION CHECKS', () => {

    it('should return 403 eith wrong secret', async () => {
        const response = await axios.delete(cleanupUrl(authId), {
            headers: {
                'x-test-secret': 'wrong-secret',
            },
            validateStatus: () => true,
        });
        expect(response.status).toBe(403);
    });
});