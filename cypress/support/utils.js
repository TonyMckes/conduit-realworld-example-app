export const getUniqueUserName = () => {
    const date = new Date()
    return `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}-${date.getMilliseconds()}`
}
