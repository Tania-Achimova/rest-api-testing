import axios, { AxiosResponse } from 'axios';
import { TEST_CLEANUP_SECRET } from '../config';
import { config } from '../config';
import { expectRejected } from '../test-units';

const singupUrl = `${config.BASE_URL}/signup`;

beforeAll(async () => {
    // Ensure the test user is created before running tests
   const databaseUrl = `${config.BASE_URL}/test/database`;
});