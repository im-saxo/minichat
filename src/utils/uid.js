const generateUid = () => {
    const timestamp = Date.now().toString().slice(0, -3);
    const random = Math.random().toString(36).substr(2, 4);

    return `${random}${timestamp}`;
};

export default {
    generateUid,
};
