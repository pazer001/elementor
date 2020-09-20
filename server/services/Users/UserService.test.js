require('dotenv').config();
const faker = require('faker');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const UserService = require('./UserService');
const userService = new UserService();

const email = 'paz@paz.com';
const password = '3ds21cds3c51';

describe('UserService', () => {
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
        expect(await userService.loginUser(email, password, 'test', '127.0.0.1')).toHaveProperty('token');
    });

    test('userInfo Positive', async () => {
        const {token} = await userService.loginUser(email, password, 'test', '127.0.0.1')
        const user = jwt.verify(token, config.jwtSecret)
        const userInfo = userService.userInfo(user);

        expect(userInfo.email).toBe(email);
    });

    test('onlineUsers Positive', async () => {
        const results = await userService.onlineUsers();

        expect(results.length).toBeGreaterThanOrEqual(1);
    });

    test('logoutUser Positive', async () => {
        const {token} = await userService.loginUser(email, password, 'test', '127.0.0.1');
        const user = jwt.verify(token, config.jwtSecret)
        const results = await userService.logoutUser(user);

        expect(results).toBe(true);
    });
})