const pages = [`welcome`, `main`];

const PROTOCOL = window.PROTOCOL;
const HOST = window.HOST;
const VERSION = window.VERSION;

const appHandler = {
    state: {},
    helpers: {
        urlBuild: (path) => {
            return `${PROTOCOL}://${HOST}/${VERSION}/${path}`;
        }
    },
    actions: {
        init: () => {
            appHandler.actions.registerEvents();

            const token = localStorage.getItem(`token`);
            if (token) {
                appHandler.actions.showPage(`main`)
            } else {
                appHandler.actions.showPage(`welcome`)
            }
        },
        onLoadPageEvent: async (pageName) => {
            switch (pageName) {
                case `main`:
                    const userInfoResults   =   await appHandler.actions.userInfo();
                    const userInfoElm   =   document.getElementById(`user`);
                    userInfoElm.innerText = `Hello ${userInfoResults.email}`;
                    userInfoElm.classList.add(`show`);
                    userInfoElm.classList.remove(`hide`);

            }
        },
        registerEvents: () => {
            const registerButton = document.getElementById(`register-button`);
            registerButton.addEventListener(`click`, async () => {
                try {
                    const email = document.getElementById(`register-email`).value;
                    const password = document.getElementById(`register-password`).value;
                    await appHandler.actions.createUser(email, password);
                    await appHandler.actions.loginUser(email, password);
                    appHandler.actions.hideAlert();
                    appHandler.actions.showPage(`main`);

                } catch (e) {
                    console.error(e);
                }

            });

            const loginButton = document.getElementById(`login-button`);
            loginButton.addEventListener(`click`, async () => {
                const email = document.getElementById(`login-email`).value;
                const password = document.getElementById(`login-password`).value;
                await appHandler.actions.loginUser(email, password);
                appHandler.actions.hideAlert();
                appHandler.actions.showPage(`main`);
            })
        },
        showPage: (pageName) => {
            pages.forEach(page => {
                if (page !== pageName) {
                    const pageElm = document.getElementById(page)
                    pageElm.classList.remove('show')
                    pageElm.classList.add('hide');
                }
            })

            const pageElm = document.getElementById(pageName)
            pageElm.classList.remove('hide')
            pageElm.classList.add('show')
            appHandler.actions.onLoadPageEvent(pageName);
        },
        showAlert(message) {
            const alertElm = document.getElementById(`alert`);
            alertElm.innerText = message;
            alertElm.classList.add(`show`);
        },
        hideAlert: () => {
            const alertElm = document.getElementById(`alert`);
            alertElm.classList.add(`hide`);
        },
        createUser: async (email, password) => {
            try {
                const createUserResult = await fetch(appHandler.helpers.urlBuild(`users`), {
                    method: `POST`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({email, password})
                })
                const createUserResultJson = await createUserResult.json();
                if (createUserResult.status >= 400) {
                    console.error(createUserResultJson.message);
                    appHandler.actions.showAlert(createUserResultJson.message)
                    return Promise.reject(createUserResultJson);
                }
                return Promise.resolve(createUserResultJson);
            } catch (e) {
                appHandler.actions.showAlert(`An error occurred`);
                console.error(e);
                return Promise.reject(e);
            }
        },
        loginUser: async (email, password) => {
            try {
                const loginUserResults = await fetch(appHandler.helpers.urlBuild(`oauth/token`), {
                    method: `POST`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({email, password})
                })
                const loginUserResultsJson = await loginUserResults.json();
                if (loginUserResults.status >= 400) {
                    console.error(loginUserResultsJson.message);
                    appHandler.actions.showAlert(loginUserResultsJson.message);
                    return Promise.reject(loginUserResultsJson);
                }
                localStorage.setItem(`token`, loginUserResultsJson.token);
                return Promise.resolve(loginUserResultsJson);
            } catch (e) {
                appHandler.actions.showAlert(`An error occurred`);
                console.error(e);
                return Promise.reject(e);
            }
        },
            try {
                const loginUserResults = await fetch(appHandler.helpers.urlBuild(`oauth/token`), {
                    method: `POST`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({email, password})
                })
                const loginUserResultsJson = await loginUserResults.json();
                if (loginUserResults.status >= 400) {
                    console.error(loginUserResultsJson.message);
                    appHandler.actions.showAlert(loginUserResultsJson.message);
                    return Promise.reject(loginUserResultsJson);
                }
                localStorage.setItem(`token`, loginUserResultsJson.token);
                return Promise.resolve(loginUserResultsJson);
            } catch (e) {
                appHandler.actions.showAlert(`An error occurred`);
                console.error(e);
                return Promise.reject(e);
            }
        },
        userInfo: async () => {
            try {
                const userInfoResults = await fetch(appHandler.helpers.urlBuild(`users/info`), {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `bearer ${localStorage.getItem(`token`)}`
                    }
                })
                const userInfoResultsJson = await userInfoResults.json();
                if (userInfoResults.status >= 400) {
                    console.error(userInfoResultsJson.message);
                    appHandler.actions.showAlert(userInfoResultsJson.message);
                    return Promise.reject(userInfoResultsJson);
                }
                return Promise.resolve(userInfoResultsJson);
            } catch (e) {
                appHandler.actions.showAlert(`An error occurred`);
                console.error(e);
                return Promise.reject(e);
            }
        }
    }
};


appHandler.actions.init()

window.appHandler = appHandler;