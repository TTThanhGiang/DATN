export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const getToken = () => getUser() ? getUser().token : null;
export const getRole = () => getUser() ? getUser().vai_tro : null;
export const getUserId = () => getUser() ? getUser().ma_nguoi_dung : null;

export const logout = () => {
    localStorage.removeItem("user");
};