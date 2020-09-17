const pages =   [`welcome`, `main`];

const appHandler    =   {
    state: {},
    actions: {
        init: () => {
            appHandler.actions.registerEvents();

            const token     =   localStorage.getItem(`token`);
            if(token) {
                appHandler.actions.showPage(`main`)
            } else {
                appHandler.actions.showPage(`welcome`)
            }
        },
        registerEvents: () => {
            const registerButton    =   document.getElementById(`register-button`);
            registerButton.addEventListener(`click`, () => {
                const registerEmail    =   document.getElementById(`register-email`).value;
                const registerPassword    =   document.getElementById(`register-password`).value;
            });

            const loginButton    =   document.getElementById(`login-button`);
            loginButton.addEventListener(`click`, () => {
                const loginEmail    =   document.getElementById(`login-email`).value;
                const loginPassword    =   document.getElementById(`login-password`).value;
            })
        },
        showPage: (pageName) => {
            pages.forEach(page => {
                if(page !== pageName) {
                    document.getElementById(page).classList.add('hide');
                }
            })

            document.getElementById(pageName).classList.add('show')
        }
    }
};


appHandler.actions.init()

window.appHandler = appHandler;