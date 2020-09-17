require('dotenv').config();
const faker = require('faker');
const UserService = require('./UserService');
const userService = new UserService();

const email = 'paz@paz.com';
const password = '3ds21cds3c51';

describe('actions', () => {
    test('createUser Positive', async () => {
        const email = faker.internet.email();
        const password = faker.internet.password();

        expect(await userService.createUser(email, password)).toBe(1);
    });

    test('createUser Negative', async () => {
        try {
            await userService.createUser();
        } catch (e) {
            expect(e).toBe(false);
        }

    });

    test('loginUser Positive', async () => {
        expect(await userService.loginUser(email, password)).toHaveProperty('token');
    });

    test('userInfo Positive', async () => {
        const {token} = await userService.loginUser(email, password)
        const userInfo = userService.userInfo(token);

        expect(userInfo.email).toBe(email);
    });

    test('onlineUsers Positive', async () => {
        const {token} = await userService.loginUser(email, password)
        const results = await userService.onlineUsers(token);

        expect(results.length).toBeGreaterThanOrEqual(1);
    });

    test('logoutUser Positive', async () => {
        const {token} = await userService.loginUser(email, password)
        const results = await userService.logoutUser(token);

        expect(results).toBe(true);
    });
})