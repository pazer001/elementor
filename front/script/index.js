const pages = [`welcome`, `main`];

const PROTOCOL = window.PROTOCOL;
const HOST = window.HOST;
const VERSION = window.VERSION;
const ONLINE_USERS_INTERVAL = window.ONLINE_USERS_INTERVAL;

const appHandler = {
    state: {
        onlineUsers: [],
        intervals: {}
    },
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
            for(let i in appHandler.state.intervals) {
                clearInterval(appHandler.state.intervals[i]);
            }
            switch (pageName) {
                case `main`:
                    const userInfoResults = await appHandler.actions.userInfo();
                    const userElm = document.getElementById(`user`);
                    userElm.innerText = `Hello ${userInfoResults.email}`;
                    const infoElm = document.getElementById(`info`)
                    infoElm.classList.add(`show`);
                    infoElm.classList.remove(`hide`);

                    appHandler.actions.onlineUsersInterval();
                    clearInterval(appHandler.state.intervals.onlineUsers);
                    appHandler.state.intervals.onlineUsers = setInterval(() => {
                        appHandler.actions.onlineUsersInterval();
                    }, ONLINE_USERS_INTERVAL)


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

            const logoutButton = document.getElementById(`logout`);
            logoutButton.addEventListener(`click`, async (event) => {
                event.preventDefault();
                await appHandler.actions.logoutUser();
                appHandler.actions.showPage(`welcome`);
            })

            const userRows = Array.from(document.getElementsByClassName('user-row'));
            userRows.forEach(elm => {
                elm.addEventListener('click', appHandler.actions.showUserPopup);
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
            appHandler.actions.hideAlert();
            appHandler.actions.onLoadPageEvent(pageName);
        },
        showAlert: (message) => {
            const alertElm = document.getElementById(`alert`);
            alertElm.innerText = message;
            alertElm.classList.add(`show`);
        },
        hideAlert: () => {
            const alertElm = document.getElementById(`alert`);
            alertElm.classList.add(`hide`);
        },
        showPopup: (message) => {
            const popupWrapperElm = document.getElementById(`popup-wrapper`);
            popupWrapperElm.classList.remove('hide');
            popupWrapperElm.classList.add('show');

            const popupContentElm = document.getElementById(`popup-content`);
            popupContentElm.innerText = message;
        },
        hidePopup: () => {
            const popupElm = document.getElementById(`popup-wrapper`);
            popupElm.classList.remove('show');
            popupElm.classList.add('hide');
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
                    body: JSON.stringify({email, password, userAgent: navigator.userAgent})
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
        logoutUser: async () => {
            try {
                const logoutUserResults = await fetch(appHandler.helpers.urlBuild(`users/logout`), {
                    method: `POST`,
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `bearer ${localStorage.getItem(`token`)}`
                    }
                })
                const logoutUserResultsJson = await logoutUserResults.json();
                if (logoutUserResults.status >= 400) {
                    console.error(logoutUserResultsJson.message);
                    appHandler.actions.showAlert(logoutUserResultsJson.message);
                    return Promise.reject(logoutUserResultsJson);
                }
                localStorage.removeItem(`token`);
                return Promise.resolve(logoutUserResultsJson);
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
        },
        onlineUsers: async () => {
            try {
                const onlineUsersResults = await fetch(appHandler.helpers.urlBuild(`users/online`), {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `bearer ${localStorage.getItem(`token`)}`
                    }
                })
                const onlineUsersResultsJson = await onlineUsersResults.json();
                if (onlineUsersResults.status >= 400) {
                    console.error(onlineUsersResultsJson.message);
                    appHandler.actions.showAlert(onlineUsersResultsJson.message);
                    return Promise.reject(onlineUsersResultsJson);
                }
                return Promise.resolve(onlineUsersResultsJson);
            } catch (e) {
                appHandler.actions.showPage(`name`);
                clearInterval(appHandler.state.intervals);
                console.error(e);
                return Promise.reject(e);
            }
        },
        onlineUsersInterval: async () => {
            const onlineUsersResultsJson = await appHandler.actions.onlineUsers();
            appHandler.state.onlineUsers = onlineUsersResultsJson || [];
            const onlineUsersTbodyElm = document.querySelector(`#online-users tbody`);
            const tbodyText = onlineUsersResultsJson.map((user, key) => `<tr data-id="${key}" onclick="appHandler.actions.showUserPopup(${key})">
                <td>${user.email}</td>
                <td>${new Date(Number(user.timestamp)).toDateString()}</td>
                <td>${user.ipAddress}</td>
            </tr>`)
            onlineUsersTbodyElm.innerHTML = tbodyText.join(``);

        },
        showUserPopup(key) {
            const userInfo = appHandler.state.onlineUsers[key];
            appHandler.actions.showPopup(`
                Register time: ${new Date(Number(userInfo.registeredTimestamp)).toDateString()} ${new Date(Number(userInfo.registeredTimestamp)).toTimeString()}
                User agent: ${userInfo.userAgent}
                Login count: ${userInfo.loginCount}
            `)
        }
    }
};


appHandler.actions.init()

window.appHandler = appHandler;